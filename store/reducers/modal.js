const initialState = {
  showModal: false,
  children: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'ENABLE_MODAL':
      return {
        children: action.children,
        showModal: action.showModal,
      };
    case 'DISABLE_MODAL':
      return {
        ...state,
        showModal: action.showModal,
      };
    case 'Update_Children':
      return {
        ...state,
        children: action.children,
      };
    default:
      return state;
  }
};
