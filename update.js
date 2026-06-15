db.users.updateMany({ role: { $in: ['PROVIDER', 'PAYER'] } }, { $set: { orgAdmin: true } });
