<?php

namespace SomePanel\Security;

class FrameOptions
{
    const OPTION_ID = 'frame_security_option';
    const SAMEORIGIN_OPTION = 'SAMEORIGIN';
    const ALOW_FROM_OPTION = 'ALLOW-FROM';

    /**
     * @var int
     */
    protected $adminId = 0;

    /**
     * @var string
     */
    protected $currentResource = "";

    /**
     * FrameOptions constructor.
     *
     * @param int $adminId
     * @param string $curentResource
     */
    public function __construct($adminId = 0, $curentResource = "")
    {
        $this->adminId = $adminId;
        $this->currentResource = $curentResource;
    }

    /**
     * @static
     *
     * @codeCoverageIgnore
     */
    public static function handle()
    {
        /** @var $sessionNs \stdClass | \Zend_Session_Namespace */
        $sessionNs = new \Zend_Session_Namespace('SL_GENERAL');
        $adminId = 0;

        /**
         * More strict check for login page is required
         */

        $frameOptions = new self(
            $adminId,

            /**
             * Assign current location only for unauthenticated users
             * as it only makes sense for them (the check is made for login page only)
             * @see https://trac.example.com/ticket/33332
             */
            \Zend_Auth::getInstance()->hasIdentity() ? '' : $_SERVER['PHP_SELF']
        );
        if (null === $sessionNs->xFrameOptionsHeader) {
            $adminId = \SomePanel_Util::getResellerId();
            $frameOptions->setAdminId($adminId);
            $sessionNs->xFrameOptionsHeader = $frameOptions->getHeaderValue();
        }
        $frameOptions->sendHeader($sessionNs->xFrameOptionsHeader);
    }

    /**
     * @static
     *
     * @codeCoverageIgnore
     */
    public static function reset()
    {
        /** @var $sessionNs \stdClass|\Zend_Session_Namespace */
        $sessionNs = new \Zend_Session_Namespace('SL_GENERAL');
        $sessionNs->xFrameOptionsHeader = null;
    }

    /**
     * @param int $adminId
     *
     * @codeCoverageIgnore
     */
    public function setAdminId($adminId)
    {
        $this->adminId = $adminId;
    }

    /**
     * @return array|string
     */
    public function getCurrentOption()
    {
        $option = $this->fetchOptionFromDb();

        if (null !== $option) {
            if (self::SAMEORIGIN_OPTION === $option->value) {
                return $option->value;
            } elseif (0 === strpos($option->value, self::ALOW_FROM_OPTION . ' ')) {
                list(, $url) = explode(' ', $option->value);
                return [ 'option' => self::ALOW_FROM_OPTION, 'url' => $url ];
            }
        }

        return '';
    }

    /**
     * @param string $value
     * @param string $url
     *
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    public function updateOption($value, $url = '')
    {
        if (empty($value)) {
            $this->updateOptionInDb('');
        } elseif (self::SAMEORIGIN_OPTION === $value) {
            $this->updateOptionInDb(self::SAMEORIGIN_OPTION);
        } elseif (self::ALOW_FROM_OPTION === $value) {
            if (empty($url)
                || ! \SomePanel_Util::isValidUrl($url)) {
                throw new \InvalidArgumentException(escsprintf("The given URL (%s) is invalid", $url));
            } else {
                $this->updateOptionInDb(self::ALOW_FROM_OPTION . " {$url}");
            }
        }
    }

    /**
     * Locates current option value and inits appropriate header sending
     *
     * @param string $headerValue
     */
    public function sendHeader($headerValue = null)
    {
        if (null === $headerValue) {
            $headerValue = $this->getHeaderValue();
        }

        if (!empty($headerValue)
            && (self::SAMEORIGIN_OPTION === $headerValue
                || 0 === strpos($headerValue, self::ALOW_FROM_OPTION . ' '))) {
            $this->sendPhpHeader($headerValue);
        }
    }

    /**
     * Returns current header value
     *
     * @return string
     */
    public function getHeaderValue()
    {
        if ('/index.php' === $this->currentResource) {
            return self::SAMEORIGIN_OPTION;
        }

        $option = $this->fetchOptionFromDb();

        return $option ? $option->value : '';
    }

    /**
     * @return \Illuminate\Database\Eloquent\Model|\Option
     */
    public function fetchOptionFromDb()
    {
        $row = $this->fetchOptionByAdminId($this->adminId);

        if ($row) {
            return $row;
        }

        foreach ($this->getParentIdsOfAdmin($this->adminId) as $parentAdminId) {
            $row = $this->fetchOptionByAdminId($parentAdminId);

            if ($row) {
                return $row;
            }
        }

        return $this->fetchOptionByAdminId(0);
    }

    /**
     * @param int $adminId
     * @return \Illuminate\Database\Eloquent\Model|null|\Option
     *
     * @codeCoverageIgnore
     */
    protected function fetchOptionByAdminId($adminId)
    {
        return \Option::where('id', self::OPTION_ID)->where('reseller_id', $adminId)->first();
    }

    /**
     * @param int $adminId
     * @return array
     *
     * @codeCoverageIgnore
     */
    protected function getParentIdsOfAdmin($adminId)
    {
        return (new \SomePanel_User)->getAllParentIds($adminId);
    }

    /**
     * @param string $value
     *
     * @return void
     *
     * @codeCoverageIgnore
     */
    protected function updateOptionInDb($value)
    {
        $option = $this->fetchOptionByAdminId($this->adminId);
        if (null === $option) {
            $option = new \Option;
            $option->id = self::OPTION_ID;
            $option->reseller_id = $this->adminId;
            $option->value = $value;
            $option->save();
        } else {
            \Option::where('id', self::OPTION_ID)
                ->where('reseller_id', $this->adminId)->update([ 'value' => $value ]);
        }

        self::reset();
    }

    /**
     * @param $headerValue
     *
     * @codeCoverageIgnore
     */
    protected function sendPhpHeader($headerValue)
    {
        header("X-Frame-Options: {$headerValue}");
    }

}
