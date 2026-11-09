import { containsWordStandalone } from './matchExample';

const jp = '友達に会いました。';
console.log('index of 会:', jp.indexOf('会'));
console.log('prev:', JSON.stringify(jp[jp.indexOf('会') - 1]));
console.log('next:', JSON.stringify(jp[jp.indexOf('会') + 1]));
console.log('result:', containsWordStandalone(jp, '会', new Set()));
console.log('result 友達に:', containsWordStandalone(jp, '友達に', new Set()));
