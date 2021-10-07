const { sql } = require('slonik');

module.exports = params => {
  return sql`
    select count(*) as result
    where exists(
      select * from (
        select receiver_account_id from (
          select produced_receipt_id from (
            select converted_into_receipt_id
            from transactions
            where signer_account_id = ${params.account_id}
          ) r
          left join execution_outcome_receipts on executed_receipt_id = converted_into_receipt_id
        ) re
        inner join execution_outcome_receipts on executed_receipt_id = re.produced_receipt_id
        left join receipts on execution_outcome_receipts.produced_receipt_id = receipts.receipt_id
        union
        select receiver_account_id from (
          select converted_into_receipt_id
          from transactions
          where signer_account_id = ${params.account_id}
        ) r
        left join execution_outcome_receipts on executed_receipt_id = converted_into_receipt_id
        left join receipts on produced_receipt_id = receipts.receipt_id
      ) a
      where receiver_account_id like '%.poolv1.near'
      or receiver_account_id like 'meta-pool.near'
    )
  `;
};
