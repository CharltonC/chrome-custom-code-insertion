import { TestUtil } from '../../../asset/ts/test-util';
import { StateHandler } from '../../../service/state-handler/root';
import { StateHandle } from '../../../service/handle/state';
import { createMockAppState } from '../../../mock/app-state';
import { OptionApp } from '.';

describe('Component - Option App (UI/E2E)', () => {
    let $elem: HTMLElement;

    function getRows() {
        return {
            $header: $elem.querySelector('.datagrid__head tr') as HTMLElement,
            $rows: $elem.querySelectorAll('.datagrid__body--root > tr') as NodeListOf<HTMLElement>,
            $subRows: $elem.querySelectorAll('.datagrid__body--nested-1 tbody > tr') as NodeListOf<HTMLElement>
        };
    }

    function getCell($row: HTMLElement, isTh: boolean = false): Record<string, HTMLElement> {
        const tag = isTh ? 'th' : 'td';
        const $: Record<string, HTMLElement> = {};
        return Object.assign($, {
            $select: $row.querySelector(`${tag}:nth-child(1) input`),
            $expd: $row.querySelector('td:nth-child(3) button'),
            $badge: $row.querySelector('td:nth-child(3) .badge'),
            $del: $row.querySelector(`${tag}:nth-child(11) button`),
        });
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
        const App = StateHandle.init(OptionApp, {
            root: [ createMockAppState(), new StateHandler() ],
        });
        TestUtil.renderPlain($elem, App);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Row CRUD', () => {
        describe('Delete Row', () => {
            describe('Delete non-searched rows', () => {
                beforeEach(() => {
                    const mockAppState = createMockAppState();
                    mockAppState.setting.showDeleteModal = false;   // turn off modal so it wont popup
                    TestUtil.renderPlain($elem, StateHandle.init(OptionApp, {
                        root: [ mockAppState, new StateHandler() ],
                    }));
                });

                describe('Unsorted context (default)', () => {
                    it('should delete single row', () => {
                        const $targetRow = getRows().$rows[0];
                        TestUtil.triggerEvt(getCell($targetRow).$del, 'click');

                        const { $rows } = getRows();
                        expect($rows.length).toBe(3);
                        expect(hsTargetRow($rows, $targetRow)).toBeFalsy();
                    });

                    it('should delete single sub row (path)', () => {
                        // Expand the sub row fist
                        const $row = getRows().$rows[0];
                        const { $expd } = getCell($row);
                        TestUtil.triggerEvt($expd, 'click');

                        // Delete the sub row
                        const { $subRows } = getRows();
                        const $targetSubRow = $subRows[0];
                        TestUtil.triggerEvt(getCell($targetSubRow).$del, 'click');

                        const { $subRows: $modSubRows } = getRows();
                        expect($modSubRows.length).toBe(2);
                        expect(hsTargetRow($modSubRows, $targetSubRow)).toBeFalsy();
                    });

                    it('should delete multiple partial rows', () => {
                        // Expand the sub row fist
                        const { $header, $rows } = getRows();
                        TestUtil.triggerEvt(getCell($rows[0]).$select, 'click');
                        TestUtil.triggerEvt(getCell($rows[1]).$select, 'click');
                        TestUtil.triggerEvt(getCell($header, true).$del, 'click');

                        const { $rows: $modRows } = getRows();
                        expect($modRows.length).toBe(2);
                        expect(hsTargetRow($modRows, [$rows[0], $rows[1]])).toBeFalsy();
                    });

                    it('should delete all rows', () => {
                        const { $select, $del } = getCell(getRows().$header, true);
                        TestUtil.triggerEvt($select, 'click');
                        TestUtil.triggerEvt($del, 'click');

                        const { $rows } = getRows();
                        expect($rows.length).toBeFalsy();
                    });
                });

                // TODO: sort, modal, pagination, searched context
            });
        });

        describe('Select Row', () => {

        });
    });
});