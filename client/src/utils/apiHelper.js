// utils/apiHelper.js
export const api = async (path, method = 'GET', body = null, credentials = null) => {
  const url = "http://localhost:5000/api" + path;

  const options = {
    method,
    headers: {}
  };

  if (body) {
    options.body = JSON.stringify(body);
    options.headers["Content-Type"] = "application/json; charset=utf-8";
  }

  if (credentials) {
    const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
    options.headers.Authorization = `Basic ${encodedCredentials}`;
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      throw new Error('API response was not JSON');
    }
  } catch (error) {
    console.error('Error in API request:', error);
    throw error;
  }
};
