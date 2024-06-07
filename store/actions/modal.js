export const enableModal = (showModal, children) => {
  return {
    type: 'ENABLE_MODAL',
    children,
    showModal,
  };
};
export const disableModal = payload => {
  return {
    type: 'DISABLE_MODAL',
    showModal: payload,
  };
};

export const updateModalChild = payload => {
  return {
    type: 'Update_Children',
    children: payload,
  };
};
