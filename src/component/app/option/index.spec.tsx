import { TestUtil } from '../../../asset/ts/test-util';
import { StateHandler } from '../../../service/state-handler/root';
import { StateHandle } from '../../../service/state-handle';
import { AppState } from '../../../model/app-state';
import { createMockAppState } from '../../../mock/app-state';
import { OptionApp } from '.';

describe('Component - Option App (UI/E2E)', () => {
    let $elem: HTMLElement;
    let mockAppState: AppState;

    function getElem() {
        const pgnRecordTxt = $elem.querySelector('.paginate__record').textContent;
        const pgnRecordTxtTotal = pgnRecordTxt.length;

        return {
            totalRows: Number(pgnRecordTxt.slice(pgnRecordTxtTotal - 1, pgnRecordTxtTotal)),
            $searchInput: $elem.querySelector('.search__input') as HTMLInputElement,
            $searchClear: $elem.querySelector('.search__clear') as HTMLButtonElement,
            $header: $elem.querySelector('.datagrid__head tr') as HTMLElement,
            $rows: $elem.querySelectorAll('.datagrid__body--root > tr') as NodeListOf<HTMLElement>,
            $subRows: $elem.querySelectorAll('.datagrid__body--nested-1 tbody > tr') as NodeListOf<HTMLElement>
        };
    }

    function getCellElem($row: HTMLElement, isTh: boolean = false) {
        const tag = isTh ? 'th' : 'td';
        return {
            $select: $row.querySelector(`${tag}:nth-child(1) input`) as HTMLInputElement,
            $expd: $row.querySelector('td:nth-child(3) button') as HTMLButtonElement,
            id: $row.querySelector('td:nth-child(3) span:last-child')?.textContent,
            $badge: $row.querySelector('td:nth-child(3) .badge') as HTMLElement,
            $del: $row.querySelector(`${tag}:nth-child(11) button`) as HTMLButtonElement,
        };
    }

    function hsTargetRow($rows: NodeListOf<HTMLElement>, $targetRows: HTMLElement | HTMLElement[]): boolean {
        return !![].some.call($rows, (i, $row) => {
            return Array.isArray($targetRows) ?
                $targetRows.some((j, $targetRow) => $row === $targetRow) :
                $row === $targetRows;
        }).length;
    }

    beforeEach(() => {
        $elem = TestUtil.setupElem();
        mockAppState = createMockAppState();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Row CRUD', () => {
        describe('Delete Row', () => {
            beforeEach(() => {
                // Turn off modal so it wont popup
                mockAppState.setting.showDeleteModal = false;

                // Default sort is the ID column in ASC order
                // mockAppState.localState.sortOption = {
                //     key: 'id',
                //     isAsc: true
                // };
            });

            describe('Non-searched + Non-paginated', () => {
                beforeEach(() => {
                    TestUtil.renderPlain($elem, StateHandle.init(OptionApp, {
                        root: [ mockAppState, new StateHandler() ],
                    }));
                });

                it('should have 4 displayed rows of total 4 rows', () => {
                    const { $rows, totalRows } = getElem();

                    expect(totalRows).toBe(4);
                    expect($rows.length).toBe(4);
                });

                it('should delete single row', () => {
                    const $targetRow = getElem().$rows[0];
                    TestUtil.triggerEvt(getCellElem($targetRow).$del, 'click');
                    const { $rows, totalRows } = getElem();

                    expect(totalRows).toBe(3);
                    expect($rows.length).toBe(3);
                    expect(hsTargetRow($rows, $targetRow)).toBeFalsy();
                });

                it('should delete single sub row (path)', () => {
                    // Expand the sub row fist
                    const $row = getElem().$rows[0];
                    const { $expd } = getCellElem($row);
                    TestUtil.triggerEvt($expd, 'click');

                    // Delete the sub row
                    const { $subRows } = getElem();
                    const $targetSubRow = $subRows[0];
                    TestUtil.triggerEvt(getCellElem($targetSubRow).$del, 'click');
                    const { $subRows: $modSubRows, totalRows } = getElem();

                    expect(totalRows).toBe(4);
                    expect($modSubRows.length).toBe(2);
                    expect(hsTargetRow($modSubRows, $targetSubRow)).toBeFalsy();
                });

                it('should delete multiple partial rows', () => {
                    // Expand the sub row fist
                    const { $header, $rows } = getElem();
                    TestUtil.triggerEvt(getCellElem($rows[0]).$select, 'click');
                    TestUtil.triggerEvt(getCellElem($rows[1]).$select, 'click');
                    TestUtil.triggerEvt(getCellElem($header, true).$del, 'click');
                    const { $rows: $modRows, totalRows } = getElem();

                    expect(totalRows).toBe(2);
                    expect($modRows.length).toBe(2);
                    expect(hsTargetRow($modRows, [$rows[0], $rows[1]])).toBeFalsy();
                });

                it('should delete all rows', () => {
                    const { $select, $del } = getCellElem(getElem().$header, true);
                    TestUtil.triggerEvt($select, 'click');
                    TestUtil.triggerEvt($del, 'click');
                    const { $rows, totalRows } = getElem();

                    expect(totalRows).toBe(0);
                    expect($rows.length).toBeFalsy();
                });
            });

            describe('Non-searched + Paginated', () => {
                beforeEach(() => {
                    mockAppState.localState.pgnOption.increment = [ 2 ];    // 2 per page,
                    TestUtil.renderPlain($elem, StateHandle.init(OptionApp, {
                        root: [ mockAppState, new StateHandler() ],
                    }));
                });

                it('should have 2 displayed rows of total 4 rows', () => {
                    const { $rows, totalRows } = getElem();
                    expect($rows.length).toBe(2);
                    expect(totalRows).toBe(4);
                });

                it('should delete single row', () => {
                    const $targetRow = getElem().$rows[0];
                    TestUtil.triggerEvt(getCellElem($targetRow).$del, 'click');
                    const { $rows, totalRows } = getElem();

                    expect(totalRows).toBe(3);
                    expect($rows.length).toBe(2);
                    expect(hsTargetRow($rows, $targetRow)).toBeFalsy();
                });

                it('should delete single sub row (path)', () => {
                    // Expand the sub row fist
                    const $row = getElem().$rows[0];
                    const { $expd } = getCellElem($row);
                    TestUtil.triggerEvt($expd, 'click');

                    // Delete the sub row
                    const { $subRows } = getElem();
                    const $targetSubRow = $subRows[0];
                    TestUtil.triggerEvt(getCellElem($targetSubRow).$del, 'click');
                    const { $subRows: $modSubRows, totalRows } = getElem();

                    expect(totalRows).toBe(4);
                    expect($modSubRows.length).toBe(2);
                    expect(hsTargetRow($modSubRows, $targetSubRow)).toBeFalsy();
                });

                it('should delete multiple partial rows', () => {
                    const { $header, $rows } = getElem();
                    TestUtil.triggerEvt(getCellElem($rows[0]).$select, 'click');
                    TestUtil.triggerEvt(getCellElem
                        ($header, true).$del, 'click');
                    const { $rows: $modRows, totalRows } = getElem();

                    expect(totalRows).toBe(3);
                    expect($modRows.length).toBe(2);        // 1st page has been replaced with 2 remianing rows
                    expect(hsTargetRow($modRows, $rows[0])).toBeFalsy();
                });

                it('should delete all rows', () => {
                    const { $select, $del } = getCellElem(getElem().$header, true);
                    TestUtil.triggerEvt($select, 'click');
                    TestUtil.triggerEvt($del, 'click');
                    const { $rows, totalRows } = getElem();

                    expect(totalRows).toBe(2);
                    expect($rows.length).toBe(2);            // 1st page has been replaced with 2 remianing rows
                });
            });

            describe('Searched + Paginated', () => {
                beforeEach(() => {
                    mockAppState.localState.pgnOption.increment = [ 2 ];    // 2 per page,
                    TestUtil.renderPlain($elem, StateHandle.init(OptionApp, {
                        root: [ mockAppState, new StateHandler() ],
                    }));
                });

                it('should have 1 display row of total 1 row', () => {
                    // Search
                    const { $searchInput } = getElem();
                    TestUtil.setInputVal($searchInput, 'ebay');
                    TestUtil.triggerEvt($searchInput, 'change');
                    const { $rows, totalRows } = getElem();

                    expect(totalRows).toBe(1);
                    expect($rows.length).toBe(1);

                    // Delete search row
                    const $targetRow = getElem().$rows[0];
                    TestUtil.triggerEvt(getCellElem($targetRow).$del, 'click');
                    TestUtil.triggerEvt(getElem().$searchClear, 'click');
                    const { $rows: $modRows, totalRows: modTotalRows } = getElem();

                    expect(modTotalRows).toBe(3);
                    expect($modRows.length).toBe(2);
                    expect(hsTargetRow($modRows, $targetRow)).toBeFalsy();
                });
            });
        });

        describe('Select Row', () => {

        });
    });
});