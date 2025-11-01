import { z } from 'zod';
export { z } from 'zod';
import M from 'mongoose';

declare class MongooseZodError extends Error {
}

type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
declare const genTimestampsSchema: <CrAt = "createdAt", UpAt = "updatedAt">(createdAtField?: "createdAt" | StringLiteral<CrAt> | null, updatedAtField?: "updatedAt" | StringLiteral<UpAt> | null) => z.ZodObject<{ [_ in StringLiteral<CrAt & {}> | StringLiteral<UpAt & {}>]: z.ZodDate; } extends infer T ? { -readonly [P in keyof T]: { [_ in StringLiteral<CrAt & {}> | StringLiteral<UpAt & {}>]: z.ZodDate; }[P]; } : never, z.core.$strip>;
declare const bufferMongooseGetter: (value: unknown) => unknown;

type AnyZodObject = z.ZodObject<any, any>;
type SchemaOptions = any;
type SchemaTypeOptions<T = any> = any;
type MongooseSchemaTypeOptions = SchemaTypeOptions<any>;
declare const MongooseTypeOptionsSymbol: unique symbol;
declare const MongooseSchemaOptionsSymbol: unique symbol;
declare const ZodMongooseBrandSymbol: unique symbol;
declare const ZodMongooseInternalSymbol: unique symbol;
interface MongooseMetadata<DocType, TInstanceMethods extends {} = {}, QueryHelpers extends {} = {}, TStaticMethods extends {} = {}, TVirtuals extends {} = {}> {
    typeOptions?: {
        [Field in keyof DocType]?: SchemaTypeOptions<any>;
    };
    schemaOptions?: Omit<SchemaOptions, 'castNonArrays'> | any;
}
interface ZodMongooseInternal {
    innerType: AnyZodObject;
    mongoose: MongooseMetadata<any, any, any, any, any>;
}
type ZodMongoose = AnyZodObject & {
    readonly [ZodMongooseBrandSymbol]: true;
    readonly [ZodMongooseInternalSymbol]: ZodMongooseInternal;
} & z.ZodType<any>;
declare const isZodMongoose: (schema: unknown) => schema is ZodMongoose;
declare const getZodMongooseInternal: (schema: ZodMongoose) => ZodMongooseInternal;
declare const getMongooseTypeOptions: (schema: z.ZodTypeAny) => MongooseSchemaTypeOptions | undefined;
declare const getMongooseSchemaOptions: (schema: z.ZodTypeAny) => SchemaOptions | undefined;
declare const mergeMongooseSchemaOptions: <Schema extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>(schema: Schema, options: SchemaOptions) => Schema;
declare module 'zod' {
    interface ZodType {
        mongooseTypeOptions(options: MongooseSchemaTypeOptions): this;
        mongoose(metadata?: MongooseMetadata<any, any, any, any, any>): ZodMongoose;
    }
}
declare const toZodMongooseSchema: (zObject: AnyZodObject, metadata?: MongooseMetadata<any, any, any, any, any>) => ZodMongoose;
declare const addMongooseTypeOptions: <Schema extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>(schema: Schema, options: MongooseSchemaTypeOptions) => Schema;

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
}, M.Document<unknown, {}, M.FlatRecord<{
    [x: number]: unknown;
    [x: symbol]: unknown;
    [x: string]: unknown;
}>, any, M.ResolveSchemaOptions<M.DefaultSchemaOptions>> & M.FlatRecord<{
    [x: number]: unknown;
    [x: symbol]: unknown;
    [x: string]: unknown;
}> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;

declare const mongooseZodCustomType: (typeName: keyof typeof M.Types & keyof typeof M.Schema.Types, params?: Parameters<typeof z.instanceof>[1]) => z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>;

declare const setup: (options?: SetupOptions) => void;

export { type DisableablePlugins, MongooseSchemaOptionsSymbol, MongooseTypeOptionsSymbol, MongooseZodError, type SetupOptions, type ToMongooseSchemaOptions, type UnknownKeysHandling, type ZodMongoose, addMongooseTypeOptions, bufferMongooseGetter, genTimestampsSchema, getMongooseSchemaOptions, getMongooseTypeOptions, getZodMongooseInternal, isZodMongoose, mergeMongooseSchemaOptions, mongooseZodCustomType, setup, toMongooseSchema, toZodMongooseSchema };
