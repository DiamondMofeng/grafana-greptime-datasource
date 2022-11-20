import * as client from './greptimeService';

test('first', async () => {
  const res = await client.getGrepTimeDBData('select * from numbers limit 5');
  console.log(res);
});
