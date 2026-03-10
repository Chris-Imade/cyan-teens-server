const axios = require('axios');

const testWaitlist = async () => {
  const testData = {
    fullname: 'Test User',
    email: 'test@example.com'
  };

  console.log('Testing waitlist endpoint...');
  console.log('Test data:', testData);
  console.log('');

  try {
    const response = await axios.post('http://localhost:3000/waitlist', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Error occurred!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testWaitlist();
