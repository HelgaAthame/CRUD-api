export const serverError = JSON.stringify({
  message: `Sorry, Errors on the server side occur during the processing of your request. \n Please, try again`
});

export const invalidUrl = JSON.stringify({
  message: 'URL is invalid'
});

export const invalidId = JSON.stringify({
  message: 'User ID is invalid (not uuid)'
});

export const resourseDoesntExist = JSON.stringify({
  message: `Requested resource doesn\'t exist. Please, correct url`
});

export const notExist = JSON.stringify({
  message: 'Record with this userId doesn\'t exist'
});

export const invalidBody = JSON.stringify({
  message: 'Request body does not contain required fields'
});

export const invalidJSON = JSON.stringify({
  message: 'JSON is invalid. Please, correct body data'
});
