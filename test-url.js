const z = require('zod').z;
const { toMongooseSchema } = require('./dist/index.js');

const TestSchema = z.object({
  someURL: z.string().url(),
  someEmail: z.string().email(),
  someUUID: z.string().uuid(),
}).mongoose();

try {
  const mongooseSchema = toMongooseSchema(TestSchema);
  console.log('Success! Schema created');
} catch (error) {
  console.log('Error:', error.message);
}
