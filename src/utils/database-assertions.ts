export type DatabaseContract = {
  table: string;
  columns: string[];
  expectedCount?: number;
};

export function databaseAssertion(contract: DatabaseContract): DatabaseContract {
  return {
    table: contract.table,
    columns: contract.columns,
    expectedCount: contract.expectedCount ?? 1,
  };
}
