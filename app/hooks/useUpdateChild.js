import {useDispatch} from 'react-redux';
import {updateChildInfo} from '../../store/actions/childs';
import {filterUniqueData} from '../utils/helpers';

export function useUpdateChild() {
  const dispatch = useDispatch();

  const updateVaccine = (vaccineId, child) => {
    const checkVaccineId = child.past_vaccinations.includes(vaccineId);
    const newVaccines = filterUniqueData([
      ...child.past_vaccinations,
      vaccineId,
    ]);
    if (checkVaccineId) {
      const pastVaccinations = child.past_vaccinations.filter(
        item => item !== vaccineId,
      );
      dispatch(
        updateChildInfo({
          ...child,
          past_vaccinations: pastVaccinations,
        }),
      );
    } else {
      dispatch(updateChildInfo({...child, past_vaccinations: newVaccines}));
    }
  };

  return {updateVaccine};
}
