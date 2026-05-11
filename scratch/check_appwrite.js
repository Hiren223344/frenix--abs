
async function listDatabases() {
  const endpoint = 'https://sgp.cloud.appwrite.io/v1/databases';
  const projectId = '69ff1325002b662d7d07';
  const apiKey = 'standard_a51bad52221819d2d52c50e95fd1d43d159e42e57bfabe7cd6cef327d989b6a31d7ea83b501e11f31cd6009dafe336a02b5a9fb873b5b5d8fa2b57ac7721d7e6d8e669063b7b0f60be7b6fcc38a486b4838712d9af35f54e23721799211c913f84cae62fde8ccf50447acfdb9535eded4bc5b9958d1cf0f1e7915e51d6baae21';

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}\n${errorText}`);
      return;
    }

    const result = await response.json();
    console.log('Databases:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

listDatabases();
