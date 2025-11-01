import z5, { z } from 'zod';
export { z } from 'zod';
import M, { Schema } from 'mongoose';
import { createRequire } from 'node:module';

// src/index.ts
var MongooseTypeOptionsSymbol = Symbol.for("MongooseTypeOptions");
var MongooseSchemaOptionsSymbol = Symbol.for("MongooseSchemaOptions");
var ZodMongooseBrandSymbol = Symbol.for("MongooseZod.ZodMongooseBrand");
var ZodMongooseInternalSymbol = Symbol.for("MongooseZod.ZodMongooseInternal");
var isZodMongoose = (schema) => Boolean(schema && typeof schema === "object" && ZodMongooseBrandSymbol in schema);
var getZodMongooseInternal = (schema) => schema[ZodMongooseInternalSymbol];
var withMutableDef = (schema) => schema;
var getMongooseTypeOptions = (schema) => withMutableDef(schema)._def[MongooseTypeOptionsSymbol];
var getMongooseSchemaOptions = (schema) => withMutableDef(schema)._def[MongooseSchemaOptionsSymbol];
var mergeMongooseSchemaOptions = (schema, options) => {
  const schemaWithDef = withMutableDef(schema);
  schemaWithDef._def[MongooseSchemaOptionsSymbol] = {
    ...schemaWithDef._def[MongooseSchemaOptionsSymbol],
    ...options
  };
  return schema;
};
var attachMongooseMetadata = (schema, metadata, inner) => {
  const internal = {
    innerType: inner,
    mongoose: metadata
  };
  Object.defineProperty(schema, ZodMongooseBrandSymbol, {
    value: true,
    enumerable: false
  });
  Object.defineProperty(schema, ZodMongooseInternalSymbol, {
    value: internal,
    enumerable: false
  });
  const originalClone = schema.clone.bind(schema);
  Object.defineProperty(schema, "clone", {
    value: () => attachMongooseMetadata(originalClone(), metadata, inner)
  });
  return schema;
};
var toZodMongooseSchema = function(zObject, metadata = {}) {
  const cloned = zObject.clone();
  return attachMongooseMetadata(cloned, metadata, zObject);
};
var addMongooseToZodPrototype = (toZ) => {
  if (toZ === null) {
    if (z.ZodObject.prototype.mongoose !== void 0) {
      delete z.ZodObject.prototype.mongoose;
    }
  } else if (toZ.ZodObject.prototype.mongoose === void 0) {
    toZ.ZodObject.prototype.mongoose = function(metadata = {}) {
      return toZodMongooseSchema(this, metadata);
    };
  }
};
var addMongooseTypeOptions = function(schema, options) {
  const schemaWithDef = withMutableDef(schema);
  schemaWithDef._def[MongooseTypeOptionsSymbol] = {
    ...schemaWithDef._def[MongooseTypeOptionsSymbol] ?? {},
    ...options
  };
  return schema;
};
var addMongooseTypeOptionsToZodPrototype = (toZ) => {
  if (toZ === null) {
    if (z.ZodType.prototype.mongooseTypeOptions !== void 0) {
      delete z.ZodType.prototype.mongooseTypeOptions;
    }
  } else if (toZ.ZodType.prototype.mongooseTypeOptions === void 0) {
    toZ.ZodType.prototype.mongooseTypeOptions = function(options) {
      return addMongooseTypeOptions(this, options);
    };
  }
};

// src/errors.ts
var MongooseZodError = class extends Error {
};
var genTimestampsSchema = (createdAtField = "createdAt", updatedAtField = "updatedAt") => {
  if (createdAtField != null && updatedAtField != null && createdAtField === updatedAtField) {
    throw new MongooseZodError("`createdAt` and `updatedAt` fields must be different");
  }
  const schema = z.object({
    // Do not explicitly create `createdAt` and `updatedAt` fields. If we do,
    // mongoose will ignore the fields with the same names defined in `timestamps`.
    // Furthermore, if we control timestamps fields manually, the following error occurs upon
    // saving a document if strict mode is set to `throw`:
    // "Path `createdAt` is immutable and strict mode is set to throw."
  });
  mergeMongooseSchemaOptions(schema, {
    timestamps: {
      createdAt: createdAtField == null ? false : createdAtField,
      updatedAt: updatedAtField == null ? false : updatedAtField
    }
  });
  return schema;
};
var noCastFn = (value) => value;
var MongooseZodBoolean = class extends M.SchemaTypes.Boolean {
  constructor() {
    super(...arguments);
    this.cast = noCastFn;
  }
  static {
    this.schemaName = "MongooseZodBoolean";
  }
};
var MongooseZodDate = class extends M.SchemaTypes.Date {
  constructor() {
    super(...arguments);
    this.cast = noCastFn;
  }
  static {
    this.schemaName = "MongooseZodDate";
  }
};
var MongooseZodNumber = class extends M.SchemaTypes.Number {
  constructor() {
    super(...arguments);
    this.cast = noCastFn;
  }
  static {
    this.schemaName = "MongooseZodNumber";
  }
};
var MongooseZodString = class extends M.SchemaTypes.String {
  constructor() {
    super(...arguments);
    this.cast = noCastFn;
  }
  static {
    this.schemaName = "MongooseZodString";
  }
};
var registerCustomMongooseZodTypes = () => {
  Object.assign(M.Schema.Types, {
    MongooseZodBoolean,
    MongooseZodDate,
    MongooseZodNumber,
    MongooseZodString
  });
};
var bufferMongooseGetter = (value) => value instanceof M.mongo.Binary ? value.buffer : value;
var setupState = { isSetUp: false };
var setup = (options = {}) => {
  if (setupState.isSetUp) {
    return;
  }
  setupState.isSetUp = true;
  setupState.options = options;
  addMongooseToZodPrototype(null);
  addMongooseTypeOptionsToZodPrototype(null);
  if (options.z !== null) {
    addMongooseToZodPrototype(options.z || z);
    addMongooseTypeOptionsToZodPrototype(options.z || z);
  }
};
var getValidEnumValues = (obj) => {
  const validKeys = Object.keys(obj).filter((k) => typeof obj[obj[k]] !== "number");
  const filtered = {};
  for (const k of validKeys) {
    filtered[k] = obj[k];
  }
  return Object.values(filtered);
};
var tryImportModule = (id, importerUrl) => {
  const require2 = createRequire(importerUrl);
  try {
    const modulePath = require2.resolve(id);
    return { module: require2(modulePath) };
  } catch {
    return null;
  }
};
var isZodType = (schema, typeName) => {
  return schema.constructor.name === typeName;
};
var unwrapZodSchema = (schema, options = {}, _features = {}) => {
  const monTypeOptions = getMongooseTypeOptions(schema);
  _features.mongooseTypeOptions ||= monTypeOptions;
  const monSchemaOptions = getMongooseSchemaOptions(schema);
  _features.mongooseSchemaOptions ||= monSchemaOptions;
  if (isZodType(schema, "ZodNull") || isZodType(schema, "ZodLiteral") && schema._def.values?.includes(null)) {
    _features.isNullable = true;
  }
  if (isZodType(schema, "ZodNullable")) {
    return unwrapZodSchema(schema._def.innerType, options, {
      ..._features,
      isNullable: true
    });
  }
  if (isZodType(schema, "ZodUnion")) {
    const unionSchemas = schema._def.options;
    const unwrappedSchemas = unionSchemas.map((s) => unwrapZodSchema(s, { doNotUnwrapArrays: true }));
    _features.isNullable ||= unwrappedSchemas.some(({ features }) => features.isNullable);
    _features.isOptional ||= unwrappedSchemas.some(({ features }) => features.isOptional);
    if (!("default" in _features)) {
      const lastSchemaWithDefaultValue = unwrappedSchemas.filter((v) => "default" in v.features).at(-1);
      if (lastSchemaWithDefaultValue) {
        _features.default = lastSchemaWithDefaultValue.features.default;
      }
    }
    const uniqueUnionSchemaTypes = [
      ...new Set(unionSchemas.map((v) => v.constructor.name))
    ];
    if (uniqueUnionSchemaTypes.length === 1) {
      _features.unionSchemaType ??= uniqueUnionSchemaTypes[0];
    }
  }
  if (isZodMongoose(schema)) {
    const internal = getZodMongooseInternal(schema);
    return unwrapZodSchema(internal.innerType, options, {
      ..._features,
      mongoose: internal.mongoose
    });
  }
  if (isZodType(schema, "ZodObject")) {
    const { catchall } = schema._def;
    if (catchall && isZodType(catchall, "ZodNever")) {
      return unwrapZodSchema(schema.strip(), options, { ..._features, unknownKeys: "strict" });
    }
    if (catchall && isZodType(catchall, "ZodUnknown")) {
      return unwrapZodSchema(schema.strip(), options, { ..._features, unknownKeys: "passthrough" });
    }
  }
  if (isZodType(schema, "ZodOptional")) {
    return unwrapZodSchema(schema.unwrap(), options, { ..._features, isOptional: true });
  }
  if (isZodType(schema, "ZodDefault")) {
    const defaultDef = schema._def.defaultValue;
    const defaultValue = typeof defaultDef === "function" ? defaultDef() : defaultDef;
    return unwrapZodSchema(
      schema._def.innerType,
      options,
      // Only top-most default value ends up being used
      // (in case of `<...>.default(1).default(2)`, `2` will be used as the default value)
      "default" in _features ? _features : { ..._features, default: defaultValue }
    );
  }
  if (isZodType(schema, "ZodArray") && !options.doNotUnwrapArrays) {
    const wrapInArrayTimes = Number(_features.array?.wrapInArrayTimes || 0) + 1;
    return unwrapZodSchema(schema._def.element, options, {
      ..._features,
      array: {
        ..._features.array,
        wrapInArrayTimes,
        originalArraySchema: _features.array?.originalArraySchema || schema
      }
    });
  }
  return { schema, features: _features };
};
var zodInstanceofOriginalClasses = /* @__PURE__ */ new WeakMap();
var mongooseZodCustomType = (typeName, params) => {
  const instanceClass = typeName === "Buffer" ? Buffer : M.Types[typeName];
  const typeClass = M.Schema.Types[typeName];
  const result = z.instanceof(instanceClass, params);
  zodInstanceofOriginalClasses.set(result, typeClass);
  return result;
};

// src/to-mongoose.ts
var { Mixed: MongooseMixed } = M.Schema.Types;
var originalMongooseLean = M.Query.prototype.lean;
registerCustomMongooseZodTypes();
var mlvPlugin = tryImportModule("mongoose-lean-virtuals", import.meta.url);
var mldPlugin = tryImportModule("mongoose-lean-defaults", import.meta.url);
var mlgPlugin = tryImportModule("mongoose-lean-getters", import.meta.url);
var getFixedOptionFn = (fn) => function(...args) {
  const thisFixed = this && this instanceof M.Document ? this : void 0;
  return fn.apply(thisFixed, args);
};
var getStrictOptionValue = (unknownKeys, schemaFeatures) => {
  const isStrictThrow = unknownKeys == null || unknownKeys === "throw" || schemaFeatures.unknownKeys === "strict";
  const isStrictFalse = unknownKeys === "strip-unless-overridden" && schemaFeatures.unknownKeys === "passthrough";
  return isStrictThrow ? "throw" : !isStrictFalse;
};
var addMongooseSchemaFields = (zodSchema, monSchema, context) => {
  const {
    fieldsStack = [],
    monSchemaOptions,
    monTypeOptions: monTypeOptionsFromSchema,
    unknownKeys
  } = context;
  const addToField = fieldsStack.at(-1);
  const fieldPath = fieldsStack.join(".");
  const isRoot = addToField == null;
  const throwError = (message, noPath) => {
    throw new MongooseZodError(`${noPath ? "" : `Path \`${fieldPath}\`: `}${message}`);
  };
  const { schema: zodSchemaFinal, features: schemaFeatures } = unwrapZodSchema(zodSchema);
  const monMetadata = schemaFeatures.mongoose || {};
  const {
    mongooseTypeOptions: monTypeOptionsFromField,
    mongooseSchemaOptions: monSchemaOptionsFromField,
    unionSchemaType
  } = schemaFeatures;
  const monTypeOptions = { ...monTypeOptionsFromField, ...monTypeOptionsFromSchema };
  const { isOptional, isNullable } = schemaFeatures;
  const isRequired = !isOptional;
  const isFieldArray = "array" in schemaFeatures;
  const mzOptions = [
    ["validate", monTypeOptions.mzValidate],
    ["required", monTypeOptions.mzRequired]
  ];
  mzOptions.forEach(([origName]) => {
    const mzName = `mz${origName[0]?.toUpperCase()}${origName.slice(1)}`;
    if (mzName in monTypeOptions) {
      if (origName in monTypeOptions) {
        throwError(`Can't have both "${mzName}" and "${origName}" set`);
      }
      monTypeOptions[origName] = monTypeOptions[mzName];
      delete monTypeOptions[mzName];
    }
  });
  const commonFieldOptions = {
    required: isRequired,
    ..."default" in schemaFeatures ? { default: schemaFeatures.default } : (
      // `mongoose-lean-defaults` will implicitly set default values on sub schemas.
      // It will result in sub documents being ALWAYS defined after using `.lean()`
      // and even optional fields of that schema having `undefined` values.
      // This looks very weird to me and even broke my production.
      // You need to explicitly set `default: undefined` to sub schemas to prevent such a behaviour.
      isFieldArray || isZodType(zodSchemaFinal, "ZodObject") ? { default: void 0 } : {}
    ),
    ...isFieldArray && { castNonArrays: false },
    ...monTypeOptions
  };
  const [[, mzValidate], [, mzRequired]] = mzOptions;
  if (mzValidate != null) {
    let mzv = mzValidate;
    if (typeof mzv === "function") {
      mzv = getFixedOptionFn(mzv);
    } else if (!Array.isArray(mzv) && typeof mzv === "object" && !(mzv instanceof RegExp)) {
      mzv.validator = getFixedOptionFn(mzv.validator);
    } else if (Array.isArray(mzv) && !(mzv[0] instanceof RegExp && typeof mzv[1] === "string")) {
      const [firstElem, secondElem] = mzv;
      if (typeof firstElem === "function" && typeof secondElem === "string") {
        commonFieldOptions.mzValidate = [getFixedOptionFn(firstElem), secondElem];
      }
    }
    commonFieldOptions.validate = mzv;
  }
  if (mzRequired != null) {
    let mzr = mzRequired;
    if (typeof mzr === "function") {
      mzr = getFixedOptionFn(mzr);
    } else if (Array.isArray(mzr) && typeof mzr[0] === "function") {
      const [probablyFn] = mzr;
      if (typeof probablyFn === "function") {
        mzr[0] = getFixedOptionFn(probablyFn);
      }
    }
    commonFieldOptions.required = mzr;
  }
  if (isRequired) {
    if (commonFieldOptions.required !== true) {
      throwError("Can't have `required` set to anything but true if `.optional()` not used");
    }
  } else if (commonFieldOptions.required === true) {
    throwError("Can't have `required` set to true and `.optional()` used");
  }
  if (isNullable && !isRoot) {
    const origRequired = commonFieldOptions.required;
    commonFieldOptions.required = function() {
      return this[addToField] === null ? false : typeof origRequired === "function" ? origRequired.call(this) : isRequired;
    };
  }
  let fieldType;
  let errMsgAddendum = "";
  const typeKey = (isRoot ? monSchemaOptions?.typeKey : context.typeKey) ?? "type";
  if (isZodType(zodSchemaFinal, "ZodObject")) {
    const relevantSchema = isRoot ? monSchema : new Schema(
      {},
      {
        strict: getStrictOptionValue(unknownKeys, schemaFeatures),
        ...monSchemaOptionsFromField,
        typeKey,
        ...monMetadata.schemaOptions
      }
    );
    const shapeEntries = Object.entries(zodSchemaFinal.shape);
    for (const [key, S] of shapeEntries) {
      addMongooseSchemaFields(S, relevantSchema, {
        ...context,
        fieldsStack: [...fieldsStack, key],
        monTypeOptions: monMetadata.typeOptions?.[key],
        typeKey: monMetadata.schemaOptions?.typeKey ?? typeKey
      });
    }
    if (isRoot) {
      return;
    }
    if (!("_id" in commonFieldOptions)) {
      commonFieldOptions._id = false;
    }
    fieldType = relevantSchema;
  } else if (isZodType(zodSchemaFinal, "ZodNumber") || unionSchemaType === "ZodNumber") {
    fieldType = MongooseZodNumber;
  } else if (isZodType(zodSchemaFinal, "ZodString") || unionSchemaType === "ZodString") {
    fieldType = MongooseZodString;
  } else if (isZodType(zodSchemaFinal, "ZodDate") || unionSchemaType === "ZodDate") {
    fieldType = MongooseZodDate;
  } else if (isZodType(zodSchemaFinal, "ZodBoolean") || unionSchemaType === "ZodBoolean") {
    fieldType = MongooseZodBoolean;
  } else if (isZodType(zodSchemaFinal, "ZodLiteral")) {
    const literalValues = zodSchemaFinal._def.values ?? [];
    if (literalValues.length !== 1) {
      errMsgAddendum = "multiple literal values are not supported";
    }
    const literalValue = literalValues[0];
    const literalJsType = typeof literalValue;
    switch (literalJsType) {
      case "boolean": {
        fieldType = MongooseZodBoolean;
        break;
      }
      case "number": {
        fieldType = Number.isNaN(literalValue) ? MongooseMixed : Number.isFinite(literalValue) ? MongooseZodNumber : void 0;
        break;
      }
      case "string": {
        fieldType = MongooseZodString;
        break;
      }
      case "object": {
        if (!literalValue) {
          fieldType = MongooseMixed;
        }
        errMsgAddendum = "object literals are not supported";
        break;
      }
      default: {
        errMsgAddendum = "only boolean, number, string or null literals are supported";
      }
    }
  } else if (isZodType(zodSchemaFinal, "ZodEnum")) {
    const entries = zodSchemaFinal.enum || {};
    const hasNativeEnumShape = Object.entries(entries).some(([key, value]) => {
      if (typeof value === "string" || typeof value === "number") {
        return String(value) !== key;
      }
      return true;
    });
    const rawOptions = zodSchemaFinal.options;
    const enumValues = hasNativeEnumShape ? getValidEnumValues(entries) : Array.isArray(rawOptions) ? [...rawOptions] : getValidEnumValues(entries);
    if (!Array.isArray(enumValues) || enumValues.length === 0) {
      errMsgAddendum = "enum must contain at least one value";
    } else if (enumValues.every((v) => typeof v === "string")) {
      fieldType = MongooseZodString;
    } else if (enumValues.every((v) => typeof v === "number")) {
      fieldType = MongooseZodNumber;
    } else {
      if (hasNativeEnumShape && enumValues.every((v) => ["string", "number"].includes(typeof v))) {
        fieldType = MongooseMixed;
      } else {
        errMsgAddendum = "only nonempty zod enums with values of a single primitive type (string or number) are supported";
      }
    }
  } else if (isZodType(zodSchema, "ZodNaN") || isZodType(zodSchema, "ZodNull")) {
    fieldType = MongooseMixed;
  } else if (isZodType(zodSchemaFinal, "ZodMap")) {
    fieldType = Map;
  } else if (isZodType(zodSchemaFinal, "ZodAny") || isZodType(zodSchemaFinal, "ZodCustom")) {
    const instanceOfClass = zodInstanceofOriginalClasses.get(zodSchemaFinal);
    fieldType = instanceOfClass || MongooseMixed;
    if (instanceOfClass === M.Schema.Types.Buffer && !("get" in commonFieldOptions)) {
      commonFieldOptions.get = bufferMongooseGetter;
    }
  } else if (isZodType(zodSchemaFinal, "ZodPipe") || isZodType(zodSchemaFinal, "ZodTransform")) {
    errMsgAddendum = "only refinements are supported";
  } else if (isZodType(zodSchemaFinal, "ZodUnknown") || isZodType(zodSchemaFinal, "ZodRecord") || isZodType(zodSchemaFinal, "ZodUnion") || isZodType(zodSchemaFinal, "ZodTuple") || isZodType(zodSchemaFinal, "ZodDiscriminatedUnion") || isZodType(zodSchemaFinal, "ZodIntersection") || isZodType(zodSchemaFinal, "ZodTypeAny") || isZodType(zodSchemaFinal, "ZodType")) {
    fieldType = MongooseMixed;
  }
  if (isRoot) {
    throw new MongooseZodError("You must provide object schema at root level");
  }
  if (fieldType == null) {
    const typeName = zodSchemaFinal.constructor.name;
    throwError(`${typeName} type is not supported${errMsgAddendum ? ` (${errMsgAddendum})` : ""}`);
  }
  if (schemaFeatures.array) {
    for (let i = 0; i < schemaFeatures.array.wrapInArrayTimes; i++) {
      fieldType = [fieldType];
    }
  }
  monSchema.add({
    [addToField]: {
      ...commonFieldOptions,
      [typeKey]: fieldType
    }
  });
  monSchema.paths[addToField]?.validate(function(value) {
    let schemaToValidate = schemaFeatures.array?.originalArraySchema || zodSchemaFinal;
    if (isZodType(schemaToValidate, "ZodObject")) {
      schemaToValidate = z5.preprocess((obj) => {
        if (!obj || typeof obj !== "object") {
          return obj;
        }
        let objMaybeCopy = obj;
        for (const [k, v] of Object.entries(objMaybeCopy)) {
          if (v instanceof M.mongo.Binary) {
            if (objMaybeCopy === obj) {
              objMaybeCopy = { ...obj };
            }
            objMaybeCopy[k] = v.buffer;
          }
        }
        return objMaybeCopy;
      }, schemaToValidate);
    }
    if (isNullable) {
      schemaToValidate = z5.nullable(schemaToValidate);
    }
    let valueToParse = value && typeof value === "object" && "toObject" in value && typeof value.toObject === "function" ? value.toObject() : value;
    if (valueToParse instanceof M.mongo.Binary) {
      valueToParse = valueToParse.buffer;
    }
    schemaToValidate.parse(valueToParse);
    return true;
  });
};
var isPluginDisabled = (name, option) => option != null && (option === true || option[name]);
var ALL_PLUGINS_DISABLED = {
  leanDefaults: true,
  leanGetters: true,
  leanVirtuals: true
};
var toMongooseSchema = (rootZodSchema, options = {}) => {
  if (!isZodMongoose(rootZodSchema)) {
    throw new MongooseZodError("Root schema must be an instance of ZodMongoose");
  }
  const globalOptions = setupState.options?.defaultToMongooseSchemaOptions || {};
  const optionsFinal = {
    ...globalOptions,
    ...options,
    disablePlugins: {
      ...globalOptions.disablePlugins === true ? { ...ALL_PLUGINS_DISABLED } : globalOptions.disablePlugins,
      ...options.disablePlugins === true ? { ...ALL_PLUGINS_DISABLED } : options.disablePlugins
    }
  };
  const { disablePlugins: dp, unknownKeys } = optionsFinal;
  const internal = getZodMongooseInternal(rootZodSchema);
  const schemaOptionsFromField = internal.innerType ? getMongooseSchemaOptions(internal.innerType) : void 0;
  const { schemaOptions = {} } = internal.mongoose;
  const addMLVPlugin = mlvPlugin && !isPluginDisabled("leanVirtuals", dp);
  const addMLDPlugin = mldPlugin && !isPluginDisabled("leanDefaults", dp);
  const addMLGPlugin = mlgPlugin && !isPluginDisabled("leanGetters", dp);
  const schema = new Schema(
    {},
    {
      id: false,
      minimize: false,
      strict: getStrictOptionValue(unknownKeys, unwrapZodSchema(rootZodSchema).features),
      ...schemaOptionsFromField,
      ...schemaOptions,
      query: {
        lean(leanOptions) {
          return originalMongooseLean.call(
            this,
            typeof leanOptions === "object" || leanOptions == null ? {
              ...addMLVPlugin && { virtuals: true },
              ...addMLDPlugin && { defaults: true },
              ...addMLGPlugin && { getters: true },
              versionKey: false,
              ...leanOptions
            } : leanOptions
          );
        },
        ...schemaOptions?.query
      }
    }
  );
  addMongooseSchemaFields(rootZodSchema, schema, { monSchemaOptions: schemaOptions, unknownKeys });
  addMLVPlugin && schema.plugin(mlvPlugin.module);
  addMLDPlugin && schema.plugin(mldPlugin.module?.default);
  addMLGPlugin && schema.plugin(mlgPlugin.module);
  return schema;
};

// src/index.ts
addMongooseToZodPrototype(z);
addMongooseTypeOptionsToZodPrototype(z);

export { MongooseSchemaOptionsSymbol, MongooseTypeOptionsSymbol, MongooseZodError, addMongooseTypeOptions, bufferMongooseGetter, genTimestampsSchema, getMongooseSchemaOptions, getMongooseTypeOptions, getZodMongooseInternal, isZodMongoose, mergeMongooseSchemaOptions, mongooseZodCustomType, setup, toMongooseSchema, toZodMongooseSchema };
