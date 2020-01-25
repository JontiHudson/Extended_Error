import ExtendedError from '..';

console.log('New Extended Error');
const newEError = new ExtendedError({
  code: 'NEW_ERROR',
  message: 'This is a new extended error',
});

const newJSError = new Error('This is a JavaScript error');

console.log('\nJavascript Error');
console.log(newJSError);

console.log('\nTransformed Extended Error');
const transformedEError = ExtendedError.transform(newEError, {
  code: 'TRANSFORMED_ERROR',
  message: 'This is a transformed error',
});

console.log(`Error unchanged: ${transformedEError === newEError}`);

console.log('\nTransformed Javascript Error');
const transformedJSError = ExtendedError.transform(newJSError, {
  code: 'TRANSFORMED_ERROR',
  message: 'This is a transformed error',
});

console.log('\nTransformed StringError');
const transformedStringError = ExtendedError.transform(
  'This is a string error',
  {
    code: 'TRANSFORMED_ERROR',
    message: 'This is a transformed error',
  },
);

transformedJSError.handle('Handle confirmation');

const transformedJSErrorJSON = JSON.stringify(transformedJSError);
console.log(transformedJSErrorJSON);

const revivedError = JSON.parse(
  transformedJSErrorJSON,
  ExtendedError.JSONreviver,
);

console.log(`\nError revived: ${revivedError instanceof ExtendedError}`);
console.log(revivedError.toString());
