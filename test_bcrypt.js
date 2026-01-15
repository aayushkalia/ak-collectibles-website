const bcrypt = require('bcryptjs');
console.log('Bcrypt loaded.');
const hash = bcrypt.hashSync('test', 10);
console.log('Hash created:', hash);
const match = bcrypt.compareSync('test', hash);
console.log('Match:', match);
