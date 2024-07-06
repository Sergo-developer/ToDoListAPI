const request = require('supertest');
const Datastore = require('@seald-io/nedb');
const createApp = require('./index');

describe('API endpoints with mocked DB', () => {
  let app;
  let mockDb;

  beforeEach(() => {
    mockDb = new Datastore();
    jest.spyOn(mockDb, 'find').mockImplementation((query, cb) => cb(null, [{ _id: '1', name: 'test', value: '123' }]));
    jest.spyOn(mockDb, 'insert').mockImplementation((doc, cb) => cb(null, { _id: '1', ...doc }));
    jest.spyOn(mockDb, 'update').mockImplementation((query, update, options, cb) => cb(null, 1));
    jest.spyOn(mockDb, 'remove').mockImplementation((query, options, cb) => cb(null, 1));
    app = createApp(mockDb);
  });

  test('GET / should fetch data', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([{ _id: '1', name: 'test', value: '123' }]);
    expect(mockDb.find).toHaveBeenCalledWith({}, expect.any(Function));
  });

  test('POST / should create a new entry', async () => {
    const res = await request(app)
      .post('/')
      .send({ name: 'test', value: '123' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({ _id: '1', name: 'test', value: '123' });
    expect(mockDb.insert).toHaveBeenCalledWith({ name: 'test', value: '123' }, expect.any(Function));
  });

  test('PUT /:id should update an entry', async () => {
    const res = await request(app)
      .put('/1')
      .send({ value: 'updated' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.numReplaced).toEqual(1);
    expect(mockDb.update).toHaveBeenCalledWith({ _id: '1' }, { $set: { value: 'updated' } }, {}, expect.any(Function));
  });

  test('DELETE /:id should delete an entry', async () => {
    const res = await request(app).delete('/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.numRemoved).toEqual(1);
    expect(mockDb.remove).toHaveBeenCalledWith({ _id: '1' }, {}, expect.any(Function));
  });
});
