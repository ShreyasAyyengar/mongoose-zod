import { z } from 'zod';
export { z } from 'zod';
import M from 'mongoose';

declare class MongooseZodError extends Error {
}

type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
declare const genTimestampsSchema: <CrAt = "createdAt", UpAt = "updatedAt">(createdAtField?: StringLiteral<CrAt | "createdAt"> | null, updatedAtField?: StringLiteral<UpAt | "updatedAt"> | null) => z.ZodObject<Record<StringLiteral<CrAt & {}> | StringLiteral<UpAt & {}>, z.ZodDate> extends infer T ? { -readonly [P in keyof T]: T[P]; } : never, z.core.$strip>;
declare const bufferMongooseGetter: (value: unknown) => unknown;

type AnyZodObject = z.ZodObject<any, any>;
type SchemaOptions = any;
type SchemaTypeOptions = any;
type MongooseSchemaTypeOptions = any;
declare const MongooseTypeOptionsSymbol: unique symbol;
declare const MongooseSchemaOptionsSymbol: unique symbol;
declare const ZodMongooseBrandSymbol: unique symbol;
declare const ZodMongooseInternalSymbol: unique symbol;
interface MongooseMetadata<DocType> {
    typeOptions?: {
        [Field in keyof DocType]?: SchemaTypeOptions;
    };
    schemaOptions?: Omit<SchemaOptions, 'castNonArrays'>;
}
interface ZodMongooseInternal {
    innerType: AnyZodObject;
    mongoose: MongooseMetadata<any>;
}
type ZodMongoose = AnyZodObject & {
    readonly [ZodMongooseBrandSymbol]: true;
    readonly [ZodMongooseInternalSymbol]: ZodMongooseInternal;
} & z.ZodType<any>;
declare const isZodMongoose: (schema: unknown) => schema is ZodMongoose;
declare const getZodMongooseInternal: (schema: ZodMongoose) => ZodMongooseInternal;
declare const getMongooseTypeOptions: (schema: z.ZodTypeAny) => MongooseSchemaTypeOptions | undefined;
declare const getMongooseSchemaOptions: (schema: z.ZodTypeAny) => SchemaOptions | undefined;
declare const mergeMongooseSchemaOptions: <Schema extends z.ZodTypeAny>(schema: Schema, options: SchemaOptions) => Schema;
declare module 'zod' {
    interface ZodType {
        mongooseTypeOptions: (options: MongooseSchemaTypeOptions) => this;
        mongoose: (metadata?: MongooseMetadata<any>) => ZodMongoose;
    }
}
declare const toZodMongooseSchema: (zObject: AnyZodObject, metadata?: MongooseMetadata<any>) => ZodMongoose;
declare const addMongooseTypeOptions: <Schema extends z.ZodTypeAny>(schema: Schema, options: MongooseSchemaTypeOptions) => Schema;

type UnknownKeysHandling = 'throw' | 'strip' | 'strip-unless-overridden';
interface DisableablePlugins {
    leanVirtuals?: boolean;
    leanDefaults?: boolean;
    leanGetters?: boolean;
}
interface ToMongooseSchemaOptions {
    disablePlugins?: DisableablePlugins | true;
    unknownKeys?: UnknownKeysHandling;
}
interface SetupOptions {
    z?: typeof z | null;
    defaultToMongooseSchemaOptions?: ToMongooseSchemaOptions;
}

declare const toMongooseSchema: (rootZodSchema: ZodMongoose, options?: ToMongooseSchemaOptions) => M.Schema<any, any, any, any, any, any, M.DefaultSchemaOptions, {
    [x: number]: unknown;
    [x: symbol]: unknown;
    [x: string]: unknown;
}, any, unknown, {
    [x: number]: {};
    [x: symbol]: {};
    [x: string]: {};
} & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;

declare const mongooseZodCustomType: (typeName: keyof typeof M.Types & keyof typeof M.Schema.Types, params?: Parameters<typeof z.instanceof>[1]) => z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>;

declare const setup: (options?: SetupOptions) => void;

export { type DisableablePlugins, MongooseSchemaOptionsSymbol, MongooseTypeOptionsSymbol, MongooseZodError, type SetupOptions, type ToMongooseSchemaOptions, type UnknownKeysHandling, type ZodMongoose, addMongooseTypeOptions, bufferMongooseGetter, genTimestampsSchema, getMongooseSchemaOptions, getMongooseTypeOptions, getZodMongooseInternal, isZodMongoose, mergeMongooseSchemaOptions, mongooseZodCustomType, setup, toMongooseSchema, toZodMongooseSchema };
