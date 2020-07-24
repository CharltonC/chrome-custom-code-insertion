import { TMethodSpy } from '../../../asset/ts/test-util/type';
import { TestUtil } from '../../../asset/ts/test-util';
import { IRawRowsOption, IParsedRowsOption, ICtxRowsQuery, IOption, IRowItemCtx, TRowsExpdState } from './type';
import { RowHandle } from '.';
import { TFn } from '../pagination/type';

describe('Service - Row Handle', () => {
    const { getItemPath, parseRowConfig, isGteZeroInt, getRowType } = RowHandle.prototype;
    let handle: RowHandle;
    let spy: TMethodSpy<RowHandle>;

    beforeEach(() => {
        handle = new RowHandle();
        spy = TestUtil.spyMethods(handle);
    });

    describe('Core Methods', () => {
        describe('Method - createOption', () => {
            const mockModOption = { data: ['a'] } as IOption;

            it('should return merged option when existing option is provided', () => {
                expect(handle.createOption(mockModOption)).toEqual({
                    rows: [],
                    showAll: false,
                    rowIdKey: 'id',
                    ...mockModOption
                });
            });

            it('should return merged option when existing option is not provided', () => {
                const mockExistOption = { data: ['b'], showAll: true } as IOption;

                expect(handle.createOption(mockModOption, mockExistOption)).toEqual({
                    ...mockExistOption,
                    ...mockModOption
                });
            });
        });

        describe('Method - createCtxRows: Get Expand state based on User`s Expand config/option', () => {
            const mockMappedItems: any[] = [];

            beforeEach(() => {
                spy.getCtxRows.mockReturnValue(mockMappedItems);
            });

            it('should return null if data is not valid', () => {
                spy.getValidatedData.mockReturnValue(false);
                expect(handle.createCtxRows()).toBeFalsy();
                expect(spy.getValidatedData).toHaveBeenCalledWith(mockMappedItems);
            });

            it('should return mapped items', () => {
                spy.getValidatedData.mockReturnValue([]);

                expect(handle.createCtxRows()).toBe(mockMappedItems);
                expect(spy.getValidatedData).toHaveBeenCalledWith(mockMappedItems);
            });
        });

        describe('Method - getCtxRows: Get mapped items based on the row configs provided', () => {
            const mockData: any[] = [ {text: 'a', id: 'xyz'}];
            const mockTransformFn: jest.Mock = jest.fn();
            const mockRows: IParsedRowsOption = { rowKey: '', transformFn: mockTransformFn };
            const mockRowType = 'odd';
            const mockItemsReq = {
                data: mockData,
                rows: [],
                rowIdKey: 'id',
                rowLvl: 0,
                parentPath: '',
                showAll: true
            } as ICtxRowsQuery;
            const mockItemPath: string = 'itemPath';
            const mockTransformResult: any = {};

            beforeEach(() => {
                mockTransformFn.mockReturnValue(mockTransformResult);
                spy.getItemPath.mockReturnValue(mockItemPath);
                spy.getRowType.mockReturnValue(mockRowType);
            });

            it('should return mapped items when transform function is provided and there are nested items', () => {

                const mockNestedItems: any[] = ['b'];
                spy.parseRowConfig.mockReturnValue(mockRows);
                spy.getCtxNestedRows.mockReturnValue(mockNestedItems);

                expect(handle.getCtxRows(mockItemsReq)).toEqual([mockTransformResult]);
                expect(spy.getCtxNestedRows).toHaveBeenCalled();
                expect(mockTransformFn).toHaveBeenCalledWith({
                    idx: 0,
                    rowType: 'odd',
                    item: mockData[0],
                    itemId: 'xyz',
                    itemKey: '',
                    itemLvl: mockItemsReq.rowLvl,
                    itemPath: mockItemPath,
                    parentPath: '',
                    nestedItems: mockNestedItems,
                    isExpdByDef: true
                });
            });

            it('should return mapped items when transform function is not provided and there is no nested items', () => {
                const mockRowIdKeyFn: jest.Mock = jest.fn();
                const mockNestedItems: any[] = null;
                const mockRowRowIdKey: string = 'abc';
                mockRowIdKeyFn.mockReturnValue(mockRowRowIdKey);
                spy.parseRowConfig.mockReturnValue({...mockRows, transformFn: null});
                spy.getCtxNestedRows.mockReturnValue(mockNestedItems);

                expect(handle.getCtxRows({
                    ...mockItemsReq,
                    rowIdKey: mockRowIdKeyFn,
                })).toEqual([{
                    itemId: mockRowRowIdKey,
                    itemKey: '',
                    itemPath: mockItemPath,
                    parentPath: '',
                    itemLvl: mockItemsReq.rowLvl,
                    nestedItems: mockNestedItems,
                    isExpdByDef: false,
                    parentItemCtx: undefined,
                    rowType: mockRowType,
                    idx: 0,
                    item: mockData[0],
                }]);
                expect(mockRowIdKeyFn).toHaveBeenCalled();
                expect(spy.getCtxNestedRows).toHaveBeenCalled();
                expect(mockTransformFn).not.toHaveBeenCalled();
            });
        });

        describe('Method - getCtxNestedRows: Get Nested Mapped Items', () => {
            const mockMappedItems: any[] = [];
            const mockNestedData: any[] = [1,2];
            const mockNestedKey: string = 'prop';
            const mockItemsReq: ICtxRowsQuery = {
                data: {[mockNestedKey]: mockNestedData},
                rows: [[mockNestedKey]],
                rowIdKey: 'id',
                rowLvl: 0,
                parentPath: '',
                showAll: true
            };

            beforeEach(() => {
                spy.getCtxRows.mockReturnValue(mockMappedItems);
            });

            it('should return mapped items when mapping is valid', () => {
                spy.getValidatedData.mockReturnValue(mockNestedData);

                expect(handle.getCtxNestedRows(mockItemsReq)).toBe(mockMappedItems);
                expect(spy.getValidatedData).toHaveBeenCalledWith(
                    mockItemsReq.data,
                    mockItemsReq.rows[0]
                );
                expect(spy.getCtxRows).toHaveBeenCalledWith({
                    ...mockItemsReq,
                    data: mockNestedData
                });
            });

            it('should return null when mapping is not valid', () => {
                spy.getValidatedData.mockReturnValue(null);

                expect(handle.getCtxNestedRows(mockItemsReq)).toBe(null);
                expect(spy.getValidatedData).toHaveBeenCalledWith(
                    mockItemsReq.data,
                    mockItemsReq.rows[0]
                );
                expect(spy.getCtxRows).not.toHaveBeenCalled();
            });
        });
    });

    describe('Methods for Feature of only Allowing One Expand/Open row per level at one time', () => {
        describe('Method - getRowCmpExpdAttr: Get the generic attributes related to the row component', () => {
            it('should return the attributes', () => {
                const mockCallback: jest.Mock = jest.fn();
                const mockOnToggle: jest.Mock = jest.fn();
                const mockCmpAttrQuery: any = {
                    itemCtx: { itemId: 'a' },
                    isOpen: true,
                    currExpdState: {},
                    callback: mockCallback
                };
                spy.getOnToggleHandler.mockReturnValue(mockOnToggle);

                const { isOpen, onClick } = handle.getRowCmpExpdAttr(mockCmpAttrQuery);
                onClick();

                expect(isOpen).toBe(mockCmpAttrQuery.isOpen);
                expect(mockOnToggle).toHaveBeenCalled();
            });
        });

        describe('Method - getOnToggleHandler: Get the Event Handler for Row Cmp for toggling the expand state', () => {
            const mockExpdState: TRowsExpdState = {'lorem': 0};
            const mockItemCtx = {} as IRowItemCtx;
            const mockCallback: jest.Mock = jest.fn();
            let onToggleHandler: TFn;

            beforeEach(() => {
                onToggleHandler = handle.getOnToggleHandler(mockItemCtx, mockExpdState, mockCallback);
                spy.rmvRowInExpdState.mockImplementation(() => {});
                spy.getRelExpdState.mockReturnValue({'rel': 1});
                spy.getFilteredCurrExpdState.mockReturnValue({'filter': 2});
            });

            it('should handle open scenario', () => {
                spy.isRowOpen.mockReturnValue(true);
                onToggleHandler();

                expect(spy.rmvRowInExpdState).toHaveBeenCalled();
                expect(spy.getRelExpdState).not.toHaveBeenCalled();
                expect(spy.getFilteredCurrExpdState).not.toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith({rowsExpdState: mockExpdState});
            });

            it('should handle clsoe scenario', () => {
                spy.isRowOpen.mockReturnValue(false);
                onToggleHandler();

                expect(spy.rmvRowInExpdState).not.toHaveBeenCalled();
                expect(spy.getRelExpdState).toHaveBeenCalled();
                expect(spy.getFilteredCurrExpdState).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith({ rowsExpdState: { rel: 1, filter: 2 } });
            });
        });

        describe('Method - getRelExpdState: Get the related expand state for items in the same hierarchy (e.g. parent, grandparent)', () => {
            const mockRowParentItemCtx = {
                itemId: 'parent',
                itemLvl: 0,
                parentItemCtx: null
            }
            const mockRowItemCtx = {
                itemId: 'child',
                itemLvl: 1,
                parentItemCtx: null
            } as IRowItemCtx;

            it('should return the state when item has parent context', () => {
                expect(handle.getRelExpdState(mockRowItemCtx)).toEqual({
                    [mockRowItemCtx.itemId]: mockRowItemCtx.itemLvl
                })
            });

            it('should return the state when item has not parent context', () => {
                expect(handle.getRelExpdState({
                    ...mockRowItemCtx,
                    parentItemCtx: mockRowParentItemCtx as IRowItemCtx
                })).toEqual({
                    [mockRowItemCtx.itemId]: mockRowItemCtx.itemLvl,
                    [mockRowParentItemCtx.itemId]: mockRowParentItemCtx.itemLvl,
                })
            });
        });

        describe('Method - getFilteredCurrExpdState: Get the filtered expand state by removing the impacted open rows at the same level from expand state', () => {
            const mockCurrExpdState: TRowsExpdState = { 'lorem': 0, 'sum': 1 };
            const mockMatchRelExpState: TRowsExpdState = { 'x': 0 };
            const mockUnMatchRelExpState: TRowsExpdState = { 'x': 3 };

            it('should return the filtered state', () => {
                expect(handle.getFilteredCurrExpdState(mockCurrExpdState, mockMatchRelExpState)).toEqual({'sum': 1});
                expect(handle.getFilteredCurrExpdState(mockCurrExpdState, mockUnMatchRelExpState)).toEqual(mockCurrExpdState);
            });
        });

        describe('Method - rmvRowInExpdState: Remove the opened row from the expand state', () => {
            const mockOpenItemId: string = 'lorem';
            const mockClosedItemId: string = 'sum';
            const mockExpdState: TRowsExpdState = { [mockOpenItemId]: 1 };

            it('should return falsy when the row is not opened or in the expand state', () => {
                expect(handle.rmvRowInExpdState(mockExpdState, mockClosedItemId)).toBeFalsy();
            });

            it('should return the updated expand state with the open row removed', () => {
                expect(handle.rmvRowInExpdState(mockExpdState, mockOpenItemId)).toEqual({});
            });
        });

        describe('Method - isRowOpen: Check if a row is open by checking in the expand state', () => {
            const mockOpenItemId: string = 'lorem';
            const mockClosedItemId: string = 'sum';
            const mockExpdState: TRowsExpdState = { [mockOpenItemId]: 0 };

            it('should return true if open', () => {
                expect(handle.isRowOpen(mockExpdState, mockOpenItemId)).toBe(true);
            });

            it('should return false if not open', () => {
                expect(handle.isRowOpen(mockExpdState, mockClosedItemId)).toBe(false);
            });

            it('should return false if expand state doesnt exist', () => {
                expect(handle.isRowOpen(null, mockOpenItemId)).toBe(false);
            });
        });
    });

    describe('Helper Methods', () => {
        describe('Method - getItemPath: Get Context for current Row', () => {
            const mockRowKey: string = 'key';
            const mockRowIdx: number = 0;
            const mockPrefixCtx: string = 'prefix';

            it('should return row context', () => {
                expect(getItemPath(mockRowIdx, null, null)).toBe(`${mockRowIdx}`);
                expect(getItemPath(mockRowIdx, null, mockPrefixCtx)).toBe(`${mockPrefixCtx}/${mockRowIdx}`);
                expect(getItemPath(mockRowIdx, mockRowKey, null)).toBe(`${mockRowKey}:${mockRowIdx}`);
                expect(getItemPath(mockRowIdx, mockRowKey, mockPrefixCtx)).toBe(`${mockPrefixCtx}/${mockRowKey}:${mockRowIdx}`);
            });
        });

        describe('Method - getRowType: Get the row type, whether its odd or even', () => {
            it('should return `odd` row type if remainder is 0 when divided by 2', () => {
                expect(getRowType(0)).toBe('odd');
                expect(getRowType(2)).toBe('odd');
            });

            it('should return `even` row type remainder is not 0 when divided by 2', () => {
                expect(getRowType(1)).toBe('even');
                expect(getRowType(3)).toBe('even');
            });
        });

        describe('Method - getValidatedData: Validate data and row config to determine if it can be proceed or not', () => {
            const mockRowKey: string = 'lorem';
            const mockTransformFn: jest.Mock = jest.fn();
            const mockConfig: IRawRowsOption = [ mockRowKey, mockTransformFn ];

            describe('when data is an array', () => {
                const mockEmptyDataAry: any[] = [];
                const mockDataAry: any[] = [1,2];

                it('should return null if data has no items', () => {
                    expect(handle.getValidatedData(mockEmptyDataAry)).toBe(null);
                });

                it('should return the data itself if data has items', () => {
                    expect(handle.getValidatedData(mockDataAry)).toBe(mockDataAry);
                });
            });

            describe('when data is an object', () => {
                const mockNestedData: any[] = [1,2];
                const mockDataObj: Record<string, any> = {[mockRowKey]: mockNestedData};

                it('should throw error if `rowkey` in config doesnt exist, or `rowKey` is empty', () => {
                    const { ROW_KEY_MISSING } = handle.errMsg;

                    expect(() => {
                        handle.getValidatedData(mockDataObj, [] as any);
                    }).toThrowError(ROW_KEY_MISSING);

                    expect(() => {
                        handle.getValidatedData(mockDataObj, [ '' ]);
                    }).toThrowError(ROW_KEY_MISSING);
                });

                it('should throw error if row key is not a string, or if data`s property exist but not an array', () => {
                    const { ROW_KEY_TYPE, PROP_DATA_TYPE } = handle.errMsg;

                    expect(() => {
                        handle.getValidatedData({}, [ ()=>{} ])
                    }).toThrowError(ROW_KEY_TYPE);

                    expect(() => {
                        handle.getValidatedData({[mockRowKey]: 'abc'}, mockConfig)
                    }).toThrowError(PROP_DATA_TYPE);
                });

                it('should return null if config doesnt exist', () => {
                    expect(handle.getValidatedData(mockDataObj, null)).toBe(null);
                });

                it('should return null if data`s property value is an empty array', () => {
                    expect(handle.getValidatedData({[mockRowKey]: []}, mockConfig)).toBe(null);
                });

                it('should return the nested data if `rowkey` exist in config and data`s property value is not an empty array', () => {
                    expect(handle.getValidatedData(mockDataObj, mockConfig)).toBe(mockNestedData);
                });
            });

        });

        describe('Method - parseRowConfig: Parse the row config depending on the row level index', () => {
            it('should parse the row config when row level index is 0', () => {
                expect(parseRowConfig([], 0)).toEqual({
                    rowKey: '',
                    transformFn: null
                });

                const mockTransformFn: jest.Mock = jest.fn();
                expect(parseRowConfig([mockTransformFn], 0)).toEqual({
                    rowKey: '',
                    transformFn: mockTransformFn
                });
            });

            it('should parse the row config when row level index is greater than 0', () => {
                expect(parseRowConfig([], 1)).toEqual({
                    rowKey: null,
                    transformFn: null
                });

                const mockRowKey: string = 'lorem';
                const mockTransformFn: jest.Mock = jest.fn();
                expect(parseRowConfig([mockRowKey, mockTransformFn], 1)).toEqual({
                    rowKey: mockRowKey,
                    transformFn: mockTransformFn
                });
            });
        });

        describe('Method - isGteZeroInt: Check if a number is an integer greater than and equal to 0', () => {
            it('should return true if it is integer gte 0', () => {
                expect(isGteZeroInt(0)).toBe(true);
            });

            it('should return false if it is not integer or not gte 0', () => {
                expect(isGteZeroInt(-1)).toBe(false);
                expect(isGteZeroInt(1.11)).toBe(false);
            });
        });
    });
});