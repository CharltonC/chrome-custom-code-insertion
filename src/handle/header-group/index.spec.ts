import { AMethodSpy } from '../../asset/ts/test-util/type';
import { TestUtil } from '../../asset/ts/test-util';
import {
    IOption,
    IBaseTbHeader, ITbHeaderCache,
    IBaseListHeader, ISpanListHeader,
} from './type';
import { HeaderGrpHandle } from '.';

describe('Header Group Handle', () => {
    let handle: HeaderGrpHandle;
    let spy: AMethodSpy<HeaderGrpHandle>;

    beforeEach(() => {
        handle = new HeaderGrpHandle();
        spy = TestUtil.spyMethods(handle);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Table Header Group', () => {
        describe('Method - getDefTbHeaderCache: Create a new default cache', () => {
            it('should return a default cache value', () => {
                expect(handle.getDefTbHeaderCache()).toEqual({
                    slots: [],
                    colTotal: 0,
                    rowTotal: 0
                });
            });
        });

        describe('Method - getCtxTbHeaders: Create rows (`tr`) of header (`th`) context used for rendering', () => {
            it('should return the table header context (with mocks)', () => {
                const mockOption: any = ['lorem'];
                const mockThColCtx: any = [];
                const mockThSpanCtx: any = [[]];
                spy.getBaseCtxTbHeaders.mockReturnValue(mockThColCtx);
                spy.getSpanCtxTbHeaders.mockReturnValue(mockThSpanCtx);

                expect(handle.getCtxTbHeaders(mockOption).headers).toBe(mockThSpanCtx);
            });

            it('should return the table header context (without mocks)', () => {
                const mockOption: IOption[] = [
                    {title: 'a', subHeader: [
                        {title: 'a-1'},
                        {title: 'a-2'}
                    ]},
                    {title: 'b'},
                ];

                expect(handle.getCtxTbHeaders(mockOption)).toEqual({
                    rowTotal: 2,
                    colTotal: 3,
                    headers: [
                        [
                            {title: 'a', colSpan: 2, rowSpan: 1, sortKey: undefined},
                            {title: 'b', colSpan: 1, rowSpan: 2, sortKey: undefined},
                        ],
                        [
                            {title: 'a-1', colSpan: 1, rowSpan: 1, sortKey: undefined},
                            {title: 'a-2', colSpan: 1, rowSpan: 1, sortKey: undefined},
                        ]
                    ]
                });
            });
        });

        describe('Method - getBaseCtxTbHeaders: Create rows (`tr`) of header (`th`) context for descendent columns', () => {
            const { getBaseCtxTbHeaders } = HeaderGrpHandle.prototype;
            const mockOption: IOption[] = [
                {title: 'a', subHeader: [
                    {title: 'a-1'},
                    {title: 'a-2'}
                ]},
                {title: 'b'},
            ];
            let mockCache: ITbHeaderCache;
            let getBaseCtxTbHeadersClone;

            beforeEach(() => {
                mockCache = {
                    rowTotal: 0,
                    colTotal: 0,
                    slots: []
                };
                getBaseCtxTbHeadersClone = getBaseCtxTbHeaders.bind(handle);
                spy.getBaseCtxTbHeaders.mockReturnValue([]);
                spy.setTbHeaderCache.mockImplementation(() => {});
            });

            it('should return the column context when row level is 0', () => {
                const { subHeader } = mockOption[0];

                expect(getBaseCtxTbHeadersClone(mockOption)).toEqual(mockCache);
                expect(spy.getDefTbHeaderCache).toHaveBeenCalled();
                expect(spy.getBaseCtxTbHeaders).toHaveBeenCalledWith(subHeader, 1, mockCache);
                expect(spy.getBaseCtxTbHeaders).toHaveBeenCalledTimes(1);
                expect(spy.setTbHeaderCache).toHaveBeenCalledTimes(3);
            });

            it('should return the column context when row level is not 0', () => {
                const { subHeader } = mockOption[0];

                expect(getBaseCtxTbHeadersClone(mockOption, 1, mockCache)).toEqual([
                    {title: 'a', ownColTotal: 0, sortKey: undefined},
                    {title: 'b', ownColTotal: null, sortKey: undefined}
                ]);
                expect(spy.getBaseCtxTbHeaders).toHaveBeenCalledWith(subHeader, 2, mockCache);
                expect(spy.getBaseCtxTbHeaders).toHaveBeenCalledTimes(1);
                expect(spy.setTbHeaderCache).toHaveBeenCalledTimes(2);
            });
        });

        describe('Method - getSpanCtxTbHeaders: Create rows (`tr`) of header (`th`) context for row span and column span', () => {
            const { getSpanCtxTbHeaders }  = HeaderGrpHandle.prototype;
            const mockColCtxs: IBaseTbHeader[][] = [
                [
                    {title: 'a', ownColTotal: 3},
                    {title: 'b'}
                ],
                [
                    {title: 'a-1'},
                    {title: 'a-2', ownColTotal: 2}
                ],
                [
                    {title: 'a-2-1'},
                    {title: 'a-2-2'}
                ],
            ];
            const [ mockColCtx1, mockColCtx2 ] = mockColCtxs;

            it('should return header context for row span and column span', () => {
                const [ colCtx1, colCtx2, colCtx3 ] = getSpanCtxTbHeaders(mockColCtxs);

                expect(colCtx1[0]).toEqual(
                    {title: 'a',
                    rowSpan: 1,
                    colSpan: mockColCtx1[0].ownColTotal
                });
                expect(colCtx1[1]).toEqual({
                    title: 'b',
                    rowSpan: mockColCtxs.length,
                    colSpan: 1
                });
                expect(colCtx2[0]).toEqual({
                    title: 'a-1',
                    rowSpan: mockColCtxs.length-1,
                    colSpan: 1
                });
                expect(colCtx2[1]).toEqual({
                    title: 'a-2',
                    rowSpan: 1,
                    colSpan: mockColCtx2[1].ownColTotal
                });
                expect(colCtx3[0]).toEqual({
                    title: 'a-2-1',
                    rowSpan: mockColCtxs.length-2,
                    colSpan: 1
                });
                expect(colCtx3[1]).toEqual({
                    title: 'a-2-2',
                    rowSpan: mockColCtxs.length-2,
                    colSpan: 1
                });
            });
        });

        describe('Method - setTbHeaderCache: Update the cache value during the process where `th` column context is being created', () => {
            const { setTbHeaderCache }  = HeaderGrpHandle.prototype;
            let mockCache: ITbHeaderCache;

            beforeEach(() => {
                mockCache = {
                    rowTotal: 0,
                    colTotal: 0,
                    slots: []
                };
            });

            it('should increment the column total when column context isnt provided', () => {
                setTbHeaderCache(mockCache, 1);
                expect(mockCache.colTotal).toBe(1);

                setTbHeaderCache(mockCache, 0);
                expect(mockCache.colTotal).toBe(2);
            });

            it('should set the column context for that row level when row level is 0 and column context is provided', () => {
                const mockColCtx: IBaseTbHeader[] = [];
                setTbHeaderCache(mockCache, 0, mockColCtx);

                const { slots, colTotal } = mockCache;
                expect(slots[0]).toBe(mockColCtx);
                expect(slots.length).toBe(1);
                expect(colTotal).toBe(0);
            });

            it('should set the column context for that row level if not already exist when row level is not 0 and column context is provied', () => {
                const mockColCtx: IBaseTbHeader[] = [];
                setTbHeaderCache(mockCache, 1, mockColCtx);

                const { slots, colTotal } = mockCache;
                expect(slots[1]).toBe(mockColCtx);
                expect(slots.length).toBe(2);
                expect(colTotal).toBe(0);
            });

            it('should append to the existing column context for that row level when row level is not 0 and column context is provided', () => {
                // Fake the existing column context and context to be appended
                (mockCache.slots[1] as any) = ['a'];
                const mockColCtx: any = ['b'];
                setTbHeaderCache(mockCache, 1, mockColCtx);

                const { slots, colTotal } = mockCache;
                expect(slots[1]).toEqual(['a', 'b']);
                expect(slots.length).toBe(2);
                expect(colTotal).toBe(0);
            });
        });
    });

    describe('List Header Group', () => {
        const mockBaseOption: IOption[] = [
            { title: 'a', subHeader: [
                {title: 'a-1', sortKey: 'x' },
                {title: 'a-2'}
            ]},
            {title: 'b'},
        ];

        const mockBaseCtxHeaders: IBaseListHeader[] = [
            { title: 'a', ownColTotal: 2, subHeader: [
                {title: 'a-1', sortKey: 'x', ownColTotal: undefined },
                {title: 'a-2', ownColTotal: undefined },
            ]},
            {title: 'b', ownColTotal: undefined }
        ];

        const mockSpanCtxHeaders: ISpanListHeader[] = [
            { title: 'a', colSpan: 2, rowSpan: 1, subHeader: [
                { title: 'a-1', colSpan: 1, rowSpan: 1, sortKey: 'x' },
                { title: 'a-2', colSpan: 1, rowSpan: 1 },
            ]},
            {title: 'b', colSpan: 1, rowSpan: 2 },
        ];

        describe('Method - getCtxListHeaders: Get the contextual list headers', () => {
            it('should return headers', () => {
                const mockBaseHeader = { rowTotal: 1, colTotal: 2, headers: [] };
                const mockSpanHeader = 'span';
                const mockFlattenHeaders = 'flat';
                spy.getBaseCtxListHeaders.mockReturnValue(mockBaseHeader);
                spy.getSpanCtxListHeaders.mockReturnValue(mockSpanHeader);
                spy.getFlattenListHeaders.mockReturnValue(mockFlattenHeaders);

                expect(handle.getCtxListHeaders(mockBaseOption)).toEqual({
                    ...mockBaseHeader,
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(1, 1fr)',
                    headers: mockFlattenHeaders
                });
            });
        });

        describe('Method - getBaseCtxListHeaders: Get the base contextual list headers', () => {
            it('should return headers', () => {
                expect(handle.getBaseCtxListHeaders(mockBaseOption)).toEqual({
                    rowTotal: 2,
                    colTotal: 3,
                    headers: mockBaseCtxHeaders
                });
            });
        });

        describe('Method - getSpanCtxListHeaders: Get the contextual Column and Row Span list headers', () => {
            it('should return headers', () => {
                const mockRowTotal: number = 2;
                expect(handle.getSpanCtxListHeaders(mockBaseCtxHeaders, mockRowTotal)).toEqual(mockSpanCtxHeaders);
            });
        });

        describe('Method - getFlattenListHeaders: Get the Flatten array for list headers', () => {
            it('should return headers', () => {
                expect(handle.getFlattenListHeaders(mockSpanCtxHeaders)).toEqual([
                    { title: 'a', colSpan: 2, rowSpan: 1, gridColumn: '1 / 3', gridRow: '1 / 2' },
                    { title: 'a-1', colSpan: 1, rowSpan: 1, gridColumn: '1 / 2', gridRow: '2 / 3' , sortKey: 'x' },
                    { title: 'a-2', colSpan: 1, rowSpan: 1, gridColumn: '2 / 3', gridRow: '2 / 3' },
                    { title: 'b', colSpan: 1, rowSpan: 2, gridColumn: '3 / 4', gridRow: '1 / 3' },
                ]);
            });
        });
    });
});