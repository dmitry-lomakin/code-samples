<?php

use SomePanel\Security\FrameOptions;

class SecurityFrameOptionsTest extends \PHPUnit_Framework_TestCase
{
    // tests
    public function testGetCurrentOptionNoDbEntryFound()
    {
        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'fetchOptionFromDb' ])
            ->getMock();
        $sut->expects($this->once())->method('fetchOptionFromDb')->will($this->returnValue(null));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEmpty($sut->getCurrentOption());
    }

    public function testGetCurrentOptionDbEntryFoundSameOrigin()
    {
        $row = new \stdClass;
        $row->value = \SomePanel\Security\FrameOptions::SAMEORIGIN_OPTION;

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'fetchOptionFromDb' ])
            ->getMock();
        $sut->expects($this->once())->method('fetchOptionFromDb')->will($this->returnValue($row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals(\SomePanel\Security\FrameOptions::SAMEORIGIN_OPTION, $sut->getCurrentOption());
    }

    public function testGetCurrentOptionDbEntryFoundAllowFrom()
    {
        $row = new \stdClass;
        $row->value = \SomePanel\Security\FrameOptions::ALOW_FROM_OPTION . ' https://example.com';

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'fetchOptionFromDb' ])
            ->getMock();
        $sut->expects($this->once())->method('fetchOptionFromDb')->will($this->returnValue($row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals(
            [ 'option' => \SomePanel\Security\FrameOptions::ALOW_FROM_OPTION, 'url' => 'https://example.com' ],
            $sut->getCurrentOption()
        );
    }

    public function testGetCurrentOptionDbEntryFoundUnknownFormat()
    {
        $row = new \stdClass;
        $row->value = '1qazXSW@';

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'fetchOptionFromDb' ])
            ->getMock();
        $sut->expects($this->once())->method('fetchOptionFromDb')->will($this->returnValue($row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals('', $sut->getCurrentOption());
    }

    public function testUpdateOptionToEmptyValue()
    {
        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'updateOptionInDb' ])
            ->getMock();
        $sut->expects($this->once())->method('updateOptionInDb')->with($this->equalTo(''));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $sut->updateOption('');
    }

    public function testUpdateOptionToSameOrigin()
    {
        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'updateOptionInDb' ])
            ->getMock();
        $sut->expects($this->once())->method('updateOptionInDb')
            ->with($this->equalTo(\SomePanel\Security\FrameOptions::SAMEORIGIN_OPTION));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $sut->updateOption(\SomePanel\Security\FrameOptions::SAMEORIGIN_OPTION);
    }

    public function testUpdateOptionToAllowFromUrlValidUrl()
    {
        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'updateOptionInDb' ])
            ->getMock();
        $sut->expects($this->once())->method('updateOptionInDb')
            ->with(
                $this->equalTo(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION . ' https://example.com')
            );

        /** @var \SomePanel\Security\FrameOptions $sut */
        $sut->updateOption(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION, 'https://example.com');
    }

    public function testUpdateOptionToAllowFromUrlInalidUrl()
    {
        $this->expectException(\InvalidArgumentException::class);

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'updateOptionInDb' ])
            ->getMock();
        $sut->expects($this->never())->method('updateOptionInDb');

        /** @var \SomePanel\Security\FrameOptions $sut */
        $sut->updateOption(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION, 'example.com');
    }

    public function testSendHeaderWithGivenValue()
    {
        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'sendPhpHeader' ])
            ->getMock();
        $sut->expects($this->once())->method('sendPhpHeader')
            ->with(
                $this->equalTo(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION . ' https://example.com')
            );

        /** @var \SomePanel\Security\FrameOptions $sut */
        $sut->sendHeader(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION . ' https://example.com');
    }

    public function testSendHeaderWithoutGivenValue()
    {
        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'getHeaderValue', 'sendPhpHeader' ])
            ->getMock();
        $sut->expects($this->once())->method('getHeaderValue')
            ->will(
                $this->returnValue(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION . ' https://example.com')
            );
        $sut->expects($this->once())->method('sendPhpHeader')
            ->with(
                $this->equalTo(\SomePanel\Security\FrameOptions::ALOW_FROM_OPTION . ' https://example.com')
            );

        /** @var \SomePanel\Security\FrameOptions $sut */
        $sut->sendHeader();
    }

    public function testGetHeaderValueForIndex()
    {
        $sut = new \SomePanel\Security\FrameOptions(0, '/index.php');

        $this->assertEquals(\SomePanel\Security\FrameOptions::SAMEORIGIN_OPTION, $sut->getHeaderValue());
    }

    public function testGetHeaderValueFromDb()
    {
        $row = new \stdClass;
        $row->value = 'xyz';

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 0, 'index' ])
            ->setMethods([ 'fetchOptionFromDb' ])
            ->getMock();
        $sut->expects($this->once())->method('fetchOptionFromDb')
            ->will($this->returnValue($row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals($row->value, $sut->getHeaderValue());
    }

    public function testFetchOptionsFromDbDirectOptionFound()
    {
        $row = new \stdClass;
        $row->value = 'xyz';

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 10, 'index' ])
            ->setMethods([ 'fetchOptionByAdminId' ])
            ->getMock();
        $sut->expects($this->once())->method('fetchOptionByAdminId')
            ->with($this->equalTo(10))
            ->will($this->returnValue($row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals($row, $sut->fetchOptionFromDb());
    }

    public function testFetchOptionsFromDbParentOptionFound()
    {
        $row = new \stdClass;
        $row->value = 'def';

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 10, 'index' ])
            ->setMethods([ 'getParentIdsOfAdmin', 'fetchOptionByAdminId' ])
            ->getMock();
        $sut->expects($this->once())->method('getParentIdsOfAdmin')
            ->will($this->returnValue([ 20, 30, 40 ]));
        $sut->expects($this->exactly(3))->method('fetchOptionByAdminId')
            ->will($this->onConsecutiveCalls(null, null, $row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals($row, $sut->fetchOptionFromDb());
    }

    public function testFetchOptionsFromDbFallbackToSuperAdminOption()
    {
        $row = new \stdClass;
        $row->value = 'opr';

        $sut = $this->getMockBuilder('\SomePanel\Security\FrameOptions')
            ->setConstructorArgs([ 10, 'index' ])
            ->setMethods([ 'getParentIdsOfAdmin', 'fetchOptionByAdminId' ])
            ->getMock();
        $sut->expects($this->once())->method('getParentIdsOfAdmin')
            ->will($this->returnValue([ 20, 30, 40 ]));
        $sut->expects($this->exactly(5))->method('fetchOptionByAdminId')
            ->will($this->onConsecutiveCalls(null, null, null, null, $row));

        /** @var \SomePanel\Security\FrameOptions $sut */
        $this->assertEquals($row, $sut->fetchOptionFromDb());
    }

}
