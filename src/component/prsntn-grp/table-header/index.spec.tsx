import { TestUtil } from '../../../asset/ts/test-util/';
import { IProps, thHandleType } from './type';
import { TableHeader } from './';

describe('Component - TODO: Component Name', () => {
    const mockThRowsCtx: thHandleType.TRowsThCtx = [
        [
            { title: 'A', sortKey: 'name', rowSpan: 2 },
            { title: 'B', sortKey: 'age' },
        ],
        [
            { title: 'C' },
        ],
    ];
    const mockGetSortBtnProps: jest.Mock = jest.fn();
    const mockProps: IProps = {
        thRowsContext: mockThRowsCtx,
        getSortBtnProps: mockGetSortBtnProps
    };
    const mockSortBtnProps = { isAsc: true };
    let $elem: HTMLElement;
    let $th: HTMLElement;
    let $tr: NodeListOf<HTMLElement>;

    function syncChildElem() {
        $th = $elem.querySelector('thead');
        $tr = $elem.querySelectorAll('tr');
    }

    beforeEach(() => {
        mockGetSortBtnProps.mockReturnValue(mockSortBtnProps);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        $elem = TestUtil.setupElem('table');
        TestUtil.renderPlain($elem, TableHeader, mockProps);
        syncChildElem();
    });

    afterEach(() => {
        TestUtil.teardown($elem);
        $elem = null;
    });

    it('should render', () => {
        expect($th.className).toBe('kz-tableheader');
        expect($tr.length).toBe(2);
        expect($tr[0].querySelectorAll('th').length).toBe(2);
        expect($tr[1].querySelectorAll('th').length).toBe(1);
        expect($tr[0].querySelector('th').rowSpan).toBe(mockThRowsCtx[0][0].rowSpan);
        expect(mockGetSortBtnProps.mock.calls).toEqual([
            [mockThRowsCtx[0][0].sortKey],
            [mockThRowsCtx[0][1].sortKey]
        ]);
    });
});
