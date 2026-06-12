import { sleep } from '../../lib/utils';
import { overdueData } from './fixtures/index';

export const overdue = {
  async getOverdue({ bucket, clientId } = {}) {
    await sleep(300);
    let invoices = [...overdueData.invoices];
    if (bucket) invoices = invoices.filter(i => i.agingBucket === bucket);
    if (clientId) invoices = invoices.filter(i => i.clientId === clientId);
    return { data: { ...overdueData, invoices } };
  },
};
