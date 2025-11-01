/* eslint-disable @typescript-eslint/prefer-function-type */
// Avoid importing complex Mongoose generics to keep TS surface simple across versions
// import type {SchemaOptions, SchemaTypeOptions} from 'mongoose';
import {z} from 'zod';
import type {PartialLaconic} from './types.js';

type SchemaOutput<Schema extends z.ZodTypeAny> = z.output<Schema>;
type AnyZodObject = z.ZodObject<any, any>;
// Minimal aliases to keep compatibility across Mongoose major versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaOptions = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaTypeOptions<T = any> = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongooseSchemaTypeOptions = SchemaTypeOptions<any>;

export const MongooseTypeOptionsSymbol = Symbol.for('MongooseTypeOptions');
export const MongooseSchemaOptionsSymbol = Symbol.for('MongooseSchemaOptions');
const ZodMongooseBrandSymbol = Symbol.for('MongooseZod.ZodMongooseBrand');
const ZodMongooseInternalSymbol = Symbol.for('MongooseZod.ZodMongooseInternal');

export interface MongooseMetadata<
  DocType,
  TInstanceMethods extends {} = {},
  QueryHelpers extends {} = {},
  TStaticMethods extends {} = {},
  TVirtuals extends {} = {},
> {
  typeOptions?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Field in keyof DocType]?: SchemaTypeOptions<any>;
  };
  // Keep schemaOptions very loose to be compatible across Mongoose versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaOptions?: Omit<SchemaOptions, 'castNonArrays'> | any;
}

interface ZodMongooseInternal {
  innerType: AnyZodObject;
  mongoose: MongooseMetadata<any, any, any, any, any>;
}

export type ZodMongoose = AnyZodObject & {
  readonly [ZodMongooseBrandSymbol]: true;
  readonly [ZodMongooseInternalSymbol]: ZodMongooseInternal;
} & z.ZodType<any>;

export const isZodMongoose = (schema: unknown): schema is ZodMongoose =>
  Boolean(schema && typeof schema === 'object' && ZodMongooseBrandSymbol in (schema as object));

export const getZodMongooseInternal = (schema: ZodMongoose) => schema[ZodMongooseInternalSymbol];

type AnyZodSchemaWithDef = z.ZodTypeAny & {
  _def: z.ZodTypeAny['_def'] & {
    [MongooseTypeOptionsSymbol]?: MongooseSchemaTypeOptions;
    [MongooseSchemaOptionsSymbol]?: SchemaOptions;
  };
};
const withMutableDef = <Schema extends z.ZodTypeAny>(schema: Schema): Schema & AnyZodSchemaWithDef =>
  schema as Schema & AnyZodSchemaWithDef;

export const getMongooseTypeOptions = (
  schema: z.ZodTypeAny,
): MongooseSchemaTypeOptions | undefined =>
  withMutableDef(schema)._def[MongooseTypeOptionsSymbol];

export const getMongooseSchemaOptions = (schema: z.ZodTypeAny): SchemaOptions | undefined =>
  withMutableDef(schema)._def[MongooseSchemaOptionsSymbol];

export const mergeMongooseSchemaOptions = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  options: SchemaOptions,
) => {
  const schemaWithDef = withMutableDef(schema);
  schemaWithDef._def[MongooseSchemaOptionsSymbol] = {
    ...schemaWithDef._def[MongooseSchemaOptionsSymbol],
    ...options,
  };
  return schema;
};

const attachMongooseMetadata = (
  schema: AnyZodObject,
  metadata: MongooseMetadata<any, any, any, any, any>,
  inner: AnyZodObject,
) => {
  const internal: ZodMongooseInternal = {
    innerType: inner,
    mongoose: metadata,
  };

  Object.defineProperty(schema, ZodMongooseBrandSymbol, {
    value: true,
    enumerable: false,
  });
  Object.defineProperty(schema, ZodMongooseInternalSymbol, {
    value: internal,
    enumerable: false,
  });

  const originalClone = schema.clone.bind(schema);
  Object.defineProperty(schema, 'clone', {
    value: () => attachMongooseMetadata(originalClone() as AnyZodObject, metadata, inner),
  });

  return schema as unknown as ZodMongoose;
};

declare module 'zod' {
  interface ZodType {
    mongooseTypeOptions(options: MongooseSchemaTypeOptions): this;
    mongoose(metadata?: MongooseMetadata<any, any, any, any, any>): ZodMongoose;
  }
}

export const toZodMongooseSchema = function (
  zObject: AnyZodObject,
  metadata: MongooseMetadata<any, any, any, any, any> = {},
) {
  const cloned = zObject.clone() as AnyZodObject;
  return attachMongooseMetadata(cloned, metadata, zObject);
};

export const addMongooseToZodPrototype = (toZ: typeof z | null) => {
  if (toZ === null) {
    if (z.ZodObject.prototype.mongoose !== undefined) {
      delete z.ZodObject.prototype.mongoose;
    }
  } else if (toZ.ZodObject.prototype.mongoose === undefined) {
    toZ.ZodObject.prototype.mongoose = function (
      this: AnyZodObject,
      metadata: MongooseMetadata<any, any, any, any, any> = {},
    ) {
      return toZodMongooseSchema(this, metadata as MongooseMetadata<any, any, any, any, any>);
    };
  }
};

export const addMongooseTypeOptions = function <Schema extends z.ZodTypeAny>(
  schema: Schema,
  options: MongooseSchemaTypeOptions,
) {
  const schemaWithDef = withMutableDef(schema);
  schemaWithDef._def[MongooseTypeOptionsSymbol] = {
    ...(schemaWithDef._def[MongooseTypeOptionsSymbol] ?? {}),
    ...options,
  } as MongooseSchemaTypeOptions;
  return schema;
};

export const addMongooseTypeOptionsToZodPrototype = (toZ: typeof z | null) => {
  if (toZ === null) {
    if (z.ZodType.prototype.mongooseTypeOptions !== undefined) {
      delete z.ZodType.prototype.mongooseTypeOptions;
    }
  } else if (toZ.ZodType.prototype.mongooseTypeOptions === undefined) {
    toZ.ZodType.prototype.mongooseTypeOptions = function (this: z.ZodTypeAny, options: MongooseSchemaTypeOptions) {
      return addMongooseTypeOptions(this, options);
    };
  }
};


export {z} from 'zod';
