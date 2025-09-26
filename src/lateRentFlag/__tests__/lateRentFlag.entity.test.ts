import 'reflect-metadata';
import {DataSource} from 'typeorm';
import Tenant from '../../tenant/tenant.entity';
import LateRentFlag from '../lateRentFlag.entity';

let ds: DataSource;

beforeAll(async () => {
  ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [Tenant, LateRentFlag],
    synchronize: true,
    logging: false,
  });
  await ds.initialize();
});

afterAll(async () => {
  await ds.destroy();
});

beforeEach(async () => {
  await ds.getRepository(LateRentFlag).clear();
  await ds.getRepository(Tenant).clear();
});

it('saves with valid period and default isOn=true', async () => {
  const t = await Tenant.create({name: 'Alice', email: 'alice@example.com'}).save();

  const flag = await LateRentFlag.create({
    tenantId: t.id,
    period: '09-2025',
  }).save();

  const saved = await LateRentFlag.findOneByOrFail({id: flag.id});
  expect(saved.isOn).toBe(true);
  expect(saved.period).toBe('09-2025');
  expect(saved.tenantId).toBe(t.id);
});

it('rejects invalid period', async () => {
  const t = await Tenant.create({name: 'Bob', email: 'bob@example.com'}).save();

  await expect(LateRentFlag.create({tenantId: t.id, period: '2025-09'}).save()).rejects.toThrow(/Period must be: MM-YYYY/i);

  await expect(LateRentFlag.create({tenantId: t.id, period: '13-2025'}).save()).rejects.toThrow(/Period must be: MM-YYYY/i);
});

it('enforces unique (tenantId, period)', async () => {
  const t = await Tenant.create({name: 'Cara', email: 'cara@example.com'}).save();

  await LateRentFlag.create({tenantId: t.id, period: '09-2025'}).save();

  // second insert with the same tenant+period should fail on the UNIQUE constraint
  await expect(LateRentFlag.create({tenantId: t.id, period: '09-2025'}).save()).rejects.toThrow();
});
