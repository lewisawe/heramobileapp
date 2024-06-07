import axios from 'axios';

export async function getChildInfo(token) {
  try {
    const {data} = await axios({
      url: '/children/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function updateChildInformation(token, childId, payload) {
  try {
    const response = await axios({
      method: 'PATCH',
      url: `/children/${childId}/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      data: {
        ...payload,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
  }
}
