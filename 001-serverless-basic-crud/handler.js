'use strict';

const AWS = require('aws-sdk');

module.exports = {
  hello : async event => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Go Serverless v1.0! Your function executed successfully!',
          input: event,
        },
        null,
        2
      ),
    };
    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
  },

  create: async(event, context) => {
    let requestBody = {}
    try {
      requestBody = JSON.parse(event.body);
    } catch (exception) {
      console.log('There is an error parsing the body', exception);
      return {
        statusCode: 420
      }
    }

    if (typeof requestBody.name == 'undefined' ||
        typeof requestBody.age == 'undefined') {
      console.log('Missing parameters');
      return {
        statusCode: 400
      }
    }

    let putParams = {
      TableName: process.env.DYNAMODB_TABLE_KITTEN, 
      Item: {
        name: requestBody.name,
        age: requestBody.age,
      }
    };
    
    let putResult = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      putResult = await dynamodb.put(putParams).promise();
    } catch (exception) {
      console.log('There was a problem putting the kitten');
      console.log('putParams', putParams);
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 201,
    };
  },

  list: async(event, context) => {
    let scanParams = {
      TableName: process.env.DYNAMODB_TABLE_KITTEN,
    };

    let scanResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      scanResult = await dynamodb.scan(scanParams).promise();
    } catch (exception) {
      console.log('There was a problem putting the kitten');
      console.log('scanParams', scanParams);
      return {
        statusCode: 500,
      };
    }

    if (scanResult.Items == null || 
      !Array.isArray(scanResult.Items) ||
      scanResult.Items.length == 0) {
        return {
          statusCode: 404,
        }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(scanResult.Items.map(kitten => {
        return {
          name: kitten.name,
          age: kitten.age
        }
      }))
    }
  },

  get: async(event, context) => {
    let getParams = {
      TableName: process.env.DYNAMODB_TABLE_KITTEN,
      Key: {
        name: event.pathParameters.name
      }
    }

    let getResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      getResult = await dynamodb.get(getParams).promise();
    } catch (exception) {
      console.log('There was a problem putting the kitten');
      console.log('getParams', getParams);
      return {
        statusCode: 500,
      };
    }

    if (getResult.Item == null) {
      return {
        statusCode: 404,
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        name: getResult.Item.name,
        age: getResult.Item.age,
      })
    }
  },

  update: async(event, context) => {
    let requestBody = {}
    try {
      requestBody = JSON.parse(event.body);
    } catch (exception) {
      console.log('There is an error parsing the body', exception);
      return {
        statusCode: 400
      }
    }

    if (typeof requestBody.age == 'undefined') {
      console.log('Missing parameters');
      return {
        statusCode: 400
      }
    }

    let updateParams = {
      TableName: process.env.DYNAMODB_TABLE_KITTEN, 
      Key: {
        name: event.pathParameters.name,
      },
      UpdateExpression: 'set #age: :age',
      ExpressionAttributeName: {
        '#age': 'age',
      },
      ExpressionAttributeValues: {
        ':age': requestBody.age,
      },
    };
    
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      await dynamodb.update(updateParams).promise();
    } catch (exception) {
      console.log('There was a problem putting the kitten');
      console.log('updateParams', updateParams);
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 200,
    }
  },

  delete: async(event, context) => {
    let deleteParams = {
      TableName: process.env.DYNAMODB_TABLE_KITTEN,
      Key: {
        name: event.pathParameters.name
      }
    }

    let deleteResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      deleteResult = await dynamodb.delete(deleteParams).promise();
    } catch (exception) {
      console.log('There was a problem deleting the kitten');
      console.log('deleteParams', deleteParams);
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 200,
    };
  },
};
