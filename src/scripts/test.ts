import ExtendedError from '..';

console.log('New Extended Error');
const newEError = new ExtendedError({
  code: 'NEW_ERROR',
  message: 'This is a new extended error',
  severity: 'HIGH',
});

const newJSError = new Error('This is a JavaScript error');

console.log('\nJavascript Error');
console.log(newJSError);

console.log('\nTransformed Extended Error');
const transformedEError = ExtendedError.transform(newEError, {
  code: 'TRANSFORMED_ERROR',
  message: 'This is a transformed error',
  severity: 'MEDIUM',
});

console.log(`Error unchanged: ${transformedEError === newEError}`);

console.log('\nTransformed Javascript Error');
const transformedJSError = ExtendedError.transform(newJSError, {
  code: 'TRANSFORMED_ERROR',
  message: 'This is a transformed error',
  severity: 'MEDIUM',
});

console.log('\nTransformed StringError');
const transformedStringError = ExtendedError.transform(
  'This is a string error',
  {
    code: 'TRANSFORMED_STRING_ERROR',
    message: 'This is a transformed string error',
    severity: 'LOW',
  },
);

transformedJSError.handle('Handle confirmation');

const transformedJSErrorJSON = JSON.stringify(transformedJSError);
console.log('\n' + transformedJSErrorJSON);

const revivedError = ExtendedError.JSONparse(transformedJSErrorJSON);

console.log(`\nError revived: ${revivedError instanceof ExtendedError}`);
console.log(revivedError.print());
