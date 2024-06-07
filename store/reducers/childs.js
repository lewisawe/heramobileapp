const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_CHILDS':
      return action.payload;
    case 'UPDATE_CHILD_INFO':
      const filterState = state.filter(e => e.id !== action.payload.id);
      return [...filterState, action.payload];
    default:
      return state;
  }
};
