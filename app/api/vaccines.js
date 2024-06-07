import axios from 'axios';

export async function getVaccines(authToken) {
  try {
    const {data} = await axios({
      url: '/vaccines/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${authToken}`,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function handleVaccinesIds(token, vaccines) {
  const {data} = await axios({
    method: 'GET',
    url: '/vaccines/',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  });

  const newList = vaccines.map(
    vacName => data.filter(({name}) => name === vacName)[0].id,
  );
  /* newList will return a list of vaccines IDs [2,3,5] Depending on
    list of vaccines names ['Hepatitis A (AHA)', 'BCG', 'Hepatitis B (BHA)']*/
  return newList;
}
