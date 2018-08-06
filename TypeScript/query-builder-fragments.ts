import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterApiEntity } from "../../master-api/master-api-entity";
import { MasterApiEntityRepositoryService } from "../../../core/master-api-entity-repository.service";
import { MasterApiEntityField } from "../../master-api/master-api-entity-field";
import { MasterApiEntityFieldFilterConfig } from '../../master-api/master-api-entity-field-filter-config';
import { TranslateService } from '@ngx-translate/core' ;
import { DateFormatter } from "../../../core/date-formatter.service";
import { ISelectizeOption, SortDirection, Utils } from "../../helper/services/utils.service";
import { RedirectService } from "../../../core/redirect.service";
import { MA_EVENTS } from '../../../core/events';
import { EventsIndexes } from '../../helper/services/events.service';
import { RULES } from '../../../core/route-redirects';

declare let $: any;
declare let moment: any;
declare let _: any;

export interface Rule {
    field: string;
    operator: string;
    value?: any;
    touched?: boolean;
    valid?: boolean;
    msg?: string;
    selectizeOptions?: {
        valueConvert?: (val: any) => string;
        textConvert?: (val: any) => string;
    }
}

@Component({
    selector: 'query-builder',
    templateUrl: './query-builder.component.html',
    styleUrls: ['./query-builder.component.css'],
})
export class QueryBuilderComponent implements OnInit, AfterViewInit {
    static readonly EVENT_FILTERS_UPDATED = 'filtersUpdated';

    static readonly RULES_MATCH_AND = 'and';
    static readonly RULES_MATCH_OR  = 'or';

    customizableFields: MasterApiEntityField[];
    searchableFields: MasterApiEntityField[];

    @Input() entity: MasterApiEntity;
    @Input() actionButtons: any;

    private showActionButtons: boolean = false;
    private eventSubscriptionReferences: EventsIndexes = {};

    protected _rulesMatch: string = QueryBuilderComponent.RULES_MATCH_AND;
    protected _rules: Rule[] = [];

    protected rows: any[] = [];

    public groupBy: any = { column: '', sortDirection: SortDirection.NONE, sortable: false, allowed: false, selector: {} };

    constructor(
        public entityRepository: MasterApiEntityRepositoryService,
        protected translate: TranslateService,
        protected dateFormatter: DateFormatter,
        protected activatedRoute: ActivatedRoute,
        protected redirectService: RedirectService,
    ) {
        moment.tz.setDefault(this.dateFormatter.panelTimezone);
    }

    get rulesMatch(): string {
        return this._rulesMatch;
    }

    get rules(): Rule[] {
        return this._rules;
    }

    ngOnInit(): void {
        this.activatedRoute.params
            .subscribe(() => {
                this.initialize();
            });
    }

    public initSearchableFields(): void {
        this.searchableFields = this.entity.fields.filter(field => field.columnConfig && field.columnConfig.isSearchable);
        this.resetSelectedFields();
    }

    private initialize() {
        this.groupBy.selector = this.getGroupBySelectorConfig();

        this.customizableFields = this.entity.fields.filter(field => field.columnConfig && field.columnConfig.isCustomizable).map((field: any) => {
            field.selected = field.columnConfig.visible;
            return field;
        });

        this.initSearchableFields();

        for (let ev of this.getEntityRepoEventListeners()) {
            this.entity.EventsBus.subscribe(ev.event, ev.listener, this.eventSubscriptionReferences);
        }

        let q: string = this.activatedRoute.snapshot.paramMap.get('q');
        let query: any = null;

        try {
            // if is described as object
            query = JSON.parse(q);
        } catch (e) {
            // otherwise we might have a query rule for it
            if (RULES[q]) {
                query = RULES[q].q;
            }
        }

        if (query && query.fields && query.fields.length) {
            this.customizableFields = this.entity.fields.filter(field => field.columnConfig && field.columnConfig.isCustomizable).map((field: any) => {
                field.selected = -1 < _.pluck(query.fields, "field").indexOf(field.name);
                return field;
            });
        }

        // ...

        if (predefinedFilters.length) {
            // ...
        } else {
            if (this.hasRedirectInput()) {
                return;
            }

            this.resetToDefaultRules();
        }
    }

    private hasRedirectInput(): boolean {
        if (!this.redirectService.hasTarget(this)) return false;
        const data = this.redirectService.getData();
        this.redirectService.completed();

        if (data.input.rules) {
            this.resetToDefaultRules(data.input.rules);
        }

        if (data.input.fields) {
            this.customizableFields = this.entity.fields.filter(field => field.columnConfig && field.columnConfig.isCustomizable).map((field: any) => {
                if (_.indexOf(data.input.fields, field.name) > -1) {
                    field.columnConfig.setDisplayedByDefault();
                } else {
                    field.columnConfig.notDisplayedByDefault();
                }
                field.selected = field.columnConfig.visible;
                return field;
            });
            this.resetSelectedFields();
        }

        if (data.input.groupBy) {
            this.setGroupBy(data.input.groupBy.field);
            if (data.input.groupBy.direction == 'desc') {
                this.sortGroupDesc();
            } else {
                this.sortGroupAsc();
            }
        }

        if (data.options.runSearch) {
            setTimeout(this.change.bind(this), 500);
        }

        return true;
    }

    private getEntityRepoEventListeners(): { event: string, listener: any }[]
    {
        return [
            {
                event: MA_EVENTS.EVENT_ON_SUCCESSFUL_READ,
                listener: this.afterRepositoryRead.bind(this)
            }
        ];
    }

    afterRepositoryRead(response: any): void {
        this.rows = response.objects.length ? response.objects : [];

        this.showActionButtons = true;
    }

    protected resetToDefaultRules(fromRedirect?: Rule[]): void {
        this.resetRulesTo(fromRedirect || this.entity.getDefaultFilters());
    }

    // ...

    isCustomizedFieldDisabled(field: any): boolean {
        return field.selected && this.getSelectedFields().length == 1;
    }

    setRulesMatch(match: string): void {
        if (match === QueryBuilderComponent.RULES_MATCH_AND
            || match === QueryBuilderComponent.RULES_MATCH_OR) {
            this._rulesMatch = match;
        }
    }

    addFilter(): void {
        let firstField: MasterApiEntityField = null;

        for (let f of this.entity.getFields()) {
            if (f.filterConfig) {
                firstField = f;

                break;
            }
        }

        if (null !== firstField) {
            this.rules.push({
                field: firstField.name,
                operator: firstField.filterConfig.getDefaultOperator(),
                value: firstField.filterConfig.defaultValue,
                touched: false,
                valid: true,
                msg: ""
            });
        }
    }


    operatorIsMatch(operator: string): boolean {
        return [ 'match_regex', 'not_match_regex' ].indexOf(operator) !== -1;
    }

    // Fixing the model value of the choices when changing between (not) in and (not) match regex.
    updateRuleOperatorForChoices(index: any, operator: any): void {
        this.updateRuleOperator(index, operator);
        if (this.operatorIsMatch(operator)) {
            this.updateRuleValue(index, '');
        } else {
            this.updateRuleValue(index, { category: null, items: [] });
        }
    }

    // Fixing the model value of the selectize multiple when changing between (not) in and (not) match regex.
    updateRuleOperatorForSelectize(index: any, operator: any): void {
        this.updateRuleOperator(index, operator);
        if (this.operatorIsMatch(operator)) {
            this.updateRuleValue(index, '');
        }
    }

    updateRule(index: number, field: string, operator: string = null, value: any = null): void {
        if (! this.rules[index]) {
            return;
        }
        let fieldFilterConfig: MasterApiEntityFieldFilterConfig = this.entity.getFieldByName(field).filterConfig;

        this.rules[index].field = field;
        this.rules[index].operator =
            null === operator && fieldFilterConfig
                ? fieldFilterConfig.getDefaultOperator() : operator;
        this.rules[index].value = null === value && fieldFilterConfig
            ? (Array.isArray(fieldFilterConfig.defaultValue)
                ? fieldFilterConfig.defaultValue.slice()
                : fieldFilterConfig.defaultValue)
            : value;

        this.validateRule(index);
    }

    protected validateRule(index: number): void {
        if (this.rules[index].touched) {
            let rule: any = this.rules[index],
                field: MasterApiEntityField = this.entity.getFieldByName(rule.field);
            if (field) {
                let fieldFilterConfig: MasterApiEntityFieldFilterConfig = field.filterConfig,
                    validator = fieldFilterConfig.getValidator(rule.operator);
                this.rules[index].valid = !validator
                    || (validator && validator(rule.value));

                if (typeof rule.value === 'string' && rule.value.length > fieldFilterConfig.sizeLimit) {
                    rule.value = rule.value.substring(0, fieldFilterConfig.sizeLimit);
                }
            }
        }
    }

    updateRuleOperator(index: number, operator: string): void {
        this.updateRule(index, this.rules[index].field, operator, this.rules[index].value);
    }

    updateRuleValue(index: number, value: any, input?: any): void {
        let selStart: any = null,
            selEnd: any = null;

        if (input && "selectionStart" in input) {
            selStart = input.selectionStart;
            selEnd = input.selectionEnd;
        }

        if (this.rules[index]) {
            this.updateRule(index, this.rules[index].field, this.rules[index].operator, value);
        }

        if (null !== selStart && null !== selEnd) {
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = selStart;
            });
        }
    }

    // ...

    choicesQuickSelect(index: number, category: any, field: string): void {
        let items: any = this.entity.getFieldByName(field).filterConfig.getChoicesItems(),
            values: any = { 'category': category.id, 'items': [] };

        for (let item of items) {
            if ($.inArray(category.id, item.category) > -1) {
                values.items.push(item.value);
            }
        }

        this.updateRuleValue(index, values);
        this.touchRule(index);
    }

    selectizeQuickSelect($event: any, index: number, group: any, field: string): void {
        $event.preventDefault();

        let options: any = this.entity.getFieldByName(field).filterConfig.getSelectizeOptions(),
            values: any = { 'group': group.value, 'options': [] };

        for (let option of options) {
            if (group.value == option.group) {
                values.options.push(option.value);
            }
        }

        // ...

        this.updateRuleValue(index, values.options);
        this.touchRule(index);
    }

    updateChoicesValues(index: number, element: any, field: string): void {
        let values: any = {'category': '', 'items': []};

        if (this.rules[index].value != undefined && this.rules[index].value.items.length > 0) {
            values = this.rules[index].value;
        }

        if (element.checked) {
            values.items.push(element.value);
        } else {
            values.items.splice(_.indexOf(values.items, element.value), 1);

            //remove category
            if (values.items.length == 0) {
                values.category = undefined;
            }
        }

        this.updateRuleValue(index, values);
        this.touchRule(index);
    }

    public getCheckedStatus(index: number, value: string): boolean {
        let status1: boolean = index in this.rules
            && Array.isArray(this.rules[index].value)
            && -1 < this.rules[index].value.indexOf(value),
            status2: boolean = status1 || (index in this.rules
                && Array.isArray(this.rules[index].value.items)
                && -1 < this.rules[index].value.items.indexOf(value)); // Checked if status1 is false, actual for categorized choices

        return status1 || status2;
    }

    removeRule(index: number): void {
        if (this.rules[index]) {
            this.rules.splice(index, 1);
        }
    }

    touchRule(index: number): void {
        if (this.rules[index]) {
            this.rules[index].touched = true;
            this.validateRule(index);
        }
    }

    resetFilters(): void {
        this.resetToDefaultRules();
    }

    getOperatorLabel(op: string): string {
        let opLabels: { [index: string]: string; } = {
            "==": this.translate.instant("equals"),
            "!=": this.translate.instant("does not equal"),
            "like": this.translate.instant("contains"),
            "not_like": this.translate.instant("does not contain"),
            "ip_match": this.translate.instant("matches"),
            ">": this.translate.instant("greater than"),
            "<": this.translate.instant("less than"),
            ">=": this.translate.instant("greater than or equals"),
            "<=": this.translate.instant("less than or equals"),
            "starts_with": this.translate.instant("starts with"),
            "ends_with": this.translate.instant("ends with"),
            "in": this.translate.instant("is one of"),
            "not_in": this.translate.instant("is not one of"),
            "is": this.translate.instant("is"),
            "is_not": this.translate.instant("is not"),
            "date_on": this.translate.instant("on"),
            "date_before": this.translate.instant("before"),
            "date_after": this.translate.instant("after"),
            "date_between": this.translate.instant("between"),
            "date_previous": this.translate.instant("previous"),
            "match_regex": this.translate.instant("matches"),
            "not_match_regex": this.translate.instant("does not match"),
            "contain_word": this.translate.instant("contains"),
            "not_contain_word": this.translate.instant("does not contain"),
            "contain_phrase": this.translate.instant("contains phrase"),
            "not_contain_phrase": this.translate.instant("does not contain phrase"),
        };

        return opLabels[op] || op;
    }

    public getInvalidValueErrorMessage(field: string): string {
        return this.entity.getFieldByName(field).filterConfig.getInvalidValueErrorMessage();
    }

    public change() {
        if (this.isCurrentFilterValid()) {
            let apiRules: any[] = this.getApiFilters();

            //attach used rules to entity
            this.entity.setProperty("rules",
                [{
                    "match": this._rulesMatch,
                    "rules": apiRules
                }]
            );

            //attach selected columns to entity
            let columns: any = [];
            for (let field of this.getSelectedFields() ) {
                columns.push(field.name);
            }
            this.entity.setProperty("columns", columns);

            // Verify if the group by selection is valid.
            const selectedFields = this.getSelectedFields(true);
            this.groupBy.invalidColumn = selectedFields.length === 1 && selectedFields[0] === this.groupBy.column;

            this.entity.EventsBus.notifyDataChanged(QueryBuilderComponent.EVENT_FILTERS_UPDATED, {
                filters: [
                    {
                        "match": this._rulesMatch,
                        "rules": apiRules
                    }
                ],
                selectedFields: this.getSelectedFields(),
                groupBy: this.groupBy,
            });
        }
    }

    public getApiFilters(): any[] {
        let apiRules: any[] = [],
            ruleTransformers: any = {
                "like": (val: any) => "%" + val + "%",
                "not_like": (val: any) => "%" + val + "%",
                "starts_with": (val: any) => val + "%",
                "ends_with": (val: any) => "%" + val,
                "in": (val: any) => {
                    if (!(_.isUndefined(val.items))) {
                        return val.items;
                    }

                    return val;
                },
                "not_in": (val: any) => {
                    if (!(_.isUndefined(val.items))) {
                        return val.items;
                    }

                    return val;
                },
                "match_regex": (val: any) => val,
                "not_match_regex": (val: any) => val,
            };

        this.finishInternalValidation();

        for (let r of this.rules) {

            // Skip empty values for specific operators
            if ("" === r.value && -1 < [ "ip_match", "like" ].indexOf(r.operator)) {
                continue;
            }

            if ((false === r.value || r.value instanceof RelativeMoment )
                && -1 < [ "date_on", "date_between", "date_before", "date_after" ].indexOf(r.operator)) {
                continue;
            }

            // Apply transformtion over rules values
            let ruleValue = ruleTransformers[r.operator] ? ruleTransformers[r.operator](r.value)
                : (r.value.items !== undefined) ? r.value.items : r.value;

            if ((r.operator === "in" && ruleValue.length == 0) || ruleValue === "") {
                continue;
            }

            moment().tz(this.dateFormatter.panelTimezone);

            switch (r.operator) {
                case "date_on":
                    apiRules.
                    push({
                        field: this.entity.getFieldByName(r.field).filterConfig.getFilterBy() || r.field,
                        operator: ">=",
                        value: r.value.clone().startOf("day").utc().toISOString()
                    },{
                        field: r.field,
                        operator: "<=",
                        value: r.value.clone().endOf("day").utc().toISOString()
                    });

                    break;

                case "date_between":
                    if (r.value[0] && r.value[1]) {
                        apiRules.push({
                            field: r.field,
                            operator: ">=",
                            value: r.value[0].clone().utc().toISOString()
                        }, {
                            field: r.field,
                            operator: "<=",
                            value: r.value[1].clone().utc().toISOString()
                        });
                    }

                    break;

                case "date_before":
                    apiRules.
                    push({
                        field: r.field,
                        operator: "<=",
                        value: r.value.clone().utc().toISOString()
                    });

                    break;

                case "date_after":
                    apiRules.
                    push({
                        field: r.field,
                        operator: ">=",
                        value: r.value.clone().utc().toISOString()
                    });

                    break;

                case "date_previous":
                    if (r.value instanceof RelativeMoment) {
                        apiRules.push({
                            field: r.field,
                            operator: ">=",
                            value: this.momentDiff(r.value.m, r.value.interval) + " " + r.value.interval + " ago"
                        }, {
                            field: r.field,
                            operator: "<",
                            value: "0 days ago"
                        });
                    }

                    break;

                default:
                    const newRule = Utils.deepCopy(r);
                    const field = this.entity.getFieldByName(newRule.field);

                    if (null !== field) {
                        const filterConfig = field.filterConfig;
                        if (filterConfig.transformValue) {
                            newRule.value = filterConfig.transformValue(newRule.value);
                        }

                        apiRules.push({
                            field: this.entity.getFieldByName(r.field).filterConfig.getFilterBy() || newRule.field,
                            operator: newRule.operator
                                .replace("date_before", "<=")
                                .replace("date_after", ">=")
                                .replace("starts_with", "like")
                                .replace("ends_with", "like")
                                .replace("is_not", "!=")
                                .replace("is", "=="),
                            value: ruleTransformers[newRule.operator] ? ruleTransformers[newRule.operator](newRule.value) : newRule.value
                        });
                    }

                    break;
            }
        }

        return apiRules;
    }

    protected isCurrentFilterValid(): boolean {
        let result: boolean = true;

        this.finishInternalValidation();

        for (let r of this.rules) {
            result = result && r.valid;
        }

        return result;
    }

    private finishInternalValidation(): void {
        for (let i = 0; i < this.rules.length; i++) {
            this.touchRule(i);
            this.validateRule(i);
        }
    }

    protected quickSelectRange($event: any, index: number, field: string, range: string): void {
        $event.preventDefault();

        if (this.rules[index]) {
            switch (range) {
                case "yesterday":
                    this.updateRule(index, field, "date_on", moment().subtract(1, 'day'));
                    break;
                case "last_week":
                    this.updateRule(index, field, "date_between",
                        [ moment().startOf('isoWeek').subtract(1, 'week'), moment().startOf('isoWeek') ]
                    );
                    break;
                case "last_month":
                    this.updateRule(index, field, "date_between",
                        [ moment().startOf('month').subtract(1, 'month'), moment().startOf('month') ]);
                    break;
            }
        }
    }

    protected isQuickDateRangeSelected(index: number, range: string): boolean {
        let result: boolean = false,
            isSameDay: any = (m1: any, m2: any) => moment.isMoment(m1) && moment.isMoment(m2) && m1.isSame(m2, 'day');

        if (this.rules[index]) {
            switch (range) {
                case "yesterday":
                    result = this.rules[index].operator === "date_on"
                        && isSameDay(this.rules[index].value, moment().subtract(1, 'day'));

                    break;
                case "last_week":
                    result = this.rules[index].operator === "date_between"
                        && this.rules[index].value
                        && isSameDay(this.rules[index].value[0], moment().startOf('isoWeek').subtract(1, 'week'))
                        && isSameDay(this.rules[index].value[1], moment().startOf('isoWeek'));

                    break;
                case "last_month":
                    result = this.rules[index].operator === "date_between"
                        && this.rules[index].value
                        && isSameDay(this.rules[index].value[0], moment().startOf('month').subtract(1, 'month'))
                        && isSameDay(this.rules[index].value[1], moment().startOf('month'));

                    break;
            }
        }

        return result;
    }

    public getSelectedFields(asPlainList: boolean = false): any[] {
        return asPlainList
            ? _.pluck(this.customizableFields.filter((field: any) => field.selected), "name")
            : this.customizableFields.filter((field: any) => field.selected);
    }

    private resetSelectedFields(): void {
        this.customizableFields.forEach((field: any) => {
            field.selected = field.columnConfig.displayedByDefault;
        });
    }

    showBtnsAfterSubmit(): any {
        return (this.showActionButtons && this.actionButtons.length);
    }

    // ...

    getVisibleItemsCount(field: string): number {
        return this.entity.getFieldByName(field).filterConfig.getChoicesItems().filter((el: any) => el.visible).length;
    }

    getEnumItemsCount(field: any): number {
        return this.entity.getFieldByName(field).filterConfig.enumOptions.length;
    }

    // ...

    protected sortGroupAsc(): void {
        this.groupBy.sortDirection = SortDirection.ASC;
    }

    protected sortGroupDesc(): void {
        this.groupBy.sortDirection = SortDirection.DESC;
    }

    protected isSortGroupAsc(): boolean {
        return this.groupBy.sortDirection === SortDirection.ASC;
    }

    protected isSortGroupDesc(): boolean {
        return this.groupBy.sortDirection === SortDirection.DESC;
    }

    protected setGroupBy(groupBy: string): void {
        let previousField = this.entity.getFieldByName(this.groupBy.column);
        if (previousField) {
            previousField.columnConfig.removeGroupBy();
        }

        let field = this.entity.getFieldByName(groupBy);
        this.groupBy.allowed = field ? field.columnConfig.isSortable : false;

        if (!field || !this.groupBy.allowed) {
            this.groupBy.sortDirection = SortDirection.NONE;
        } else {
            field.columnConfig.groupBy();
            if (this.groupBy.sortDirection === SortDirection.NONE) {
                this.groupBy.sortDirection = SortDirection.ASC;
            }
            this.groupBy.sortable = field.columnConfig.isSortable;
        }

        this.groupBy.column = groupBy;
    }

    // ...

    public static isIntervalValid(interval: string): boolean {
        return 0 < ~[ "minutes", "hours", "days", "weeks", "months" ].indexOf(interval);
    }
}

export class RelativeMoment {
    public constructor(
        public m: any,
        public interval: string,
        public amount?: string
    ) {
        if (! moment.isMoment(m)) {
            throw TypeError("Invalid moment instance given");
        }

        if (! QueryBuilderComponent.isIntervalValid(this.interval)) {
            throw TypeError("Invalid interval given");
        }
    }
}