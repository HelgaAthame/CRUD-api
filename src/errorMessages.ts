export const serverError = JSON.stringify({
  msg: `Sorry, Errors on the server side occur during the processing of your request. \n Please, try again`
});

export const invalidUrl = JSON.stringify({
  msg: 'URL is invalid'
});

export const invalidId = JSON.stringify({
  msg: 'User ID is invalid (not uuid)'
});

export const resourseDoesntExist = JSON.stringify({
  msg: `Requested resource doesn\'t exist. Please, correct url`
});

export const notExist = JSON.stringify({
  msg: 'Record with this userId doesn\'t exist'
});

export const invalidBody = JSON.stringify({
  msg: 'Request body does not contain required fields'
});
