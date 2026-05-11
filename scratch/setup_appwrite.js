
const endpoint = 'https://sgp.cloud.appwrite.io/v1';
const projectId = '69ff1325002b662d7d07';
const apiKey = 'standard_a51bad52221819d2d52c50e95fd1d43d159e42e57bfabe7cd6cef327d989b6a31d7ea83b501e11f31cd6009dafe336a02b5a9fb873b5b5d8fa2b57ac7721d7e6d8e669063b7b0f60be7b6fcc38a486b4838712d9af35f54e23721799211c913f84cae62fde8ccf50447acfdb9535eded4bc5b9958d1cf0f1e7915e51d6baae21';
const databaseId = '69ff1c05000a214b9934';

async function callApi(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(`${endpoint}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    if (data.code === 409) {
        console.log(`Resource already exists at ${path}`);
        return data;
    }
    console.error(`Error on ${path}:`, data);
    return null;
  }
  return data;
}

async function setup() {
  console.log('Setting up collections...');

  // Create requests collection
  await callApi(`/databases/${databaseId}/collections`, 'POST', {
    collectionId: 'requests',
    name: 'Requests',
    permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
    documentSecurity: false
  });

  // Requests Attributes
  await callApi(`/databases/${databaseId}/collections/requests/attributes/string`, 'POST', { key: 'userId', size: 255, required: true });
  await callApi(`/databases/${databaseId}/collections/requests/attributes/string`, 'POST', { key: 'model', size: 255, required: true });
  await callApi(`/databases/${databaseId}/collections/requests/attributes/integer`, 'POST', { key: 'promptTokens', required: true });
  await callApi(`/databases/${databaseId}/collections/requests/attributes/integer`, 'POST', { key: 'completionTokens', required: true });
  await callApi(`/databases/${databaseId}/collections/requests/attributes/integer`, 'POST', { key: 'totalTokens', required: true });
  await callApi(`/databases/${databaseId}/collections/requests/attributes/string`, 'POST', { key: 'status', size: 50, required: true });
  await callApi(`/databases/${databaseId}/collections/requests/attributes/string`, 'POST', { key: 'timestamp', size: 100, required: true });

  // Create apiKeys collection
  await callApi(`/databases/${databaseId}/collections`, 'POST', {
    collectionId: 'apiKeys',
    name: 'API Keys',
    permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
    documentSecurity: false
  });

  // API Keys Attributes
  await callApi(`/databases/${databaseId}/collections/apiKeys/attributes/string`, 'POST', { key: 'userId', size: 255, required: true });
  await callApi(`/databases/${databaseId}/collections/apiKeys/attributes/string`, 'POST', { key: 'key', size: 255, required: true });
  await callApi(`/databases/${databaseId}/collections/apiKeys/attributes/string`, 'POST', { key: 'name', size: 255, required: true });
  await callApi(`/databases/${databaseId}/collections/apiKeys/attributes/string`, 'POST', { key: 'createdAt', size: 100, required: true });

  // Wait a bit for attributes to be created (Appwrite attributes are async)
  console.log('Waiting for attributes to be created...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Indexes
  console.log('Creating indexes...');
  await callApi(`/databases/${databaseId}/collections/apiKeys/indexes`, 'POST', {
    key: 'key_index',
    type: 'unique',
    attributes: ['key']
  });
  
  await callApi(`/databases/${databaseId}/collections/apiKeys/indexes`, 'POST', {
    key: 'user_index',
    type: 'key',
    attributes: ['userId']
  });

  await callApi(`/databases/${databaseId}/collections/requests/indexes`, 'POST', {
    key: 'user_requests_index',
    type: 'key',
    attributes: ['userId']
  });

  console.log('Setup finished.');
}

setup();
