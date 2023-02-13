/* eslint-disable jsdoc/require-jsdoc */

import type { Type } from 'ast-types/lib/types';
import type {
  ASTNode,
  ArrayExpression,
  ArrayPattern,
  AssignmentPattern,
  CallExpression,
  Declaration,
  FunctionExpression,
  Identifier,
  ImportDeclaration,
  MemberExpression,
  Node,
  ObjectExpression,
  ObjectMethod,
  ObjectPattern,
  ObjectProperty,
  OptionalMemberExpression,
  PropertyPattern,
  RestElement,
  SpreadElementPattern,
  SpreadPropertyPattern,
  StringLiteral,
  TSParameterProperty,
  ThisExpression,
  ASTPath as _ASTPath,
  Collection as _Collection,
} from 'jscodeshift';
import { default as j } from 'jscodeshift';
import type { ClassDecoratorName } from './util/index';
import { ACTIONS_NAME, CLASS_DECORATOR_NAMES } from './util/index';
import { isRecord } from './util/types';

export type { ClassBodyBuilder } from 'ast-types/gen/builders';
export type {
  ASTNode,
  CallExpression,
  ClassBody,
  ClassDeclaration,
  ClassMethod,
  ClassProperty,
  CommentLine,
  Declaration,
  Decorator,
  FunctionExpression,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  MemberExpression,
  VariableDeclaration,
} from 'jscodeshift';

export interface Path<N extends ASTNode = ASTNode> extends _ASTPath<N> {
  parentPath: Path | null | undefined;
}

export type Collection<N extends Node | ASTNode = ASTNode> = _Collection<N>;

export function isNode<T extends ASTNode['type'] = ASTNode['type']>(
  u: unknown,
  ...types: T[]
): u is Extract<ASTNode, { type: T }> {
  return (
    isRecord(u) &&
    typeof u['type'] === 'string' &&
    (types.length === 0 || types.includes(u['type'] as T))
  );
}

function isIdent(u: unknown, ...names: string[]): u is Identifier {
  return isNode(u, 'Identifier') && names.includes(u.name);
}

export interface EOExtendExpression extends CallExpression {
  callee: EOExtendExpressionCallee;
  arguments: EOExtendArg[];
}

export function isEOExtendExpression(u: unknown): u is EOExtendExpression {
  return (
    isNode(u, 'CallExpression') &&
    isEOExtendExpressionCallee(u.callee) &&
    u.arguments.every(isEOExtendArg)
  );
}

type EOExtendArg = EOExpression | EOMixin;

function isEOExtendArg(u: unknown): u is EOExtendArg {
  return isEOExpression(u) || isEOMixin(u);
}

interface EOExtendExpressionCallee extends MemberExpression {
  object: Identifier;
  property: EOExtendExpressionCalleeProperty;
}

function isEOExtendExpressionCallee(u: unknown): u is EOExtendExpressionCallee {
  return (
    isEOExtendsExpressionCandidate(u) &&
    isNode(u.object, 'Identifier') &&
    isEOExtendExpressionCalleeProperty(u.property)
  );
}

type EOExtendsExpressionCandidate = MemberExpression | OptionalMemberExpression;

function isEOExtendsExpressionCandidate(
  u: unknown
): u is EOExtendsExpressionCandidate {
  return isNode(u, 'MemberExpression', 'OptionalMemberExpression');
}

interface EOExtendExpressionCalleeProperty extends Identifier {
  name: 'extend';
}

function isEOExtendExpressionCalleeProperty(
  u: unknown
): u is EOExtendExpressionCalleeProperty {
  return isIdent(u, 'extend');
}

export interface EOExpression extends ObjectExpression {
  properties: EOExpressionProp[];
}

export function isEOExpression(u: unknown): u is EOExpression {
  return (
    isNode(u, 'ObjectExpression') && u.properties.every(isEOExpressionProp)
  );
}

export type EOExpressionProp = EOProp | EOMethod;

function isEOExpressionProp(u: unknown): u is EOExpressionProp {
  return isEOProp(u) || isEOMethod(u);
}

export type EOMixin = Identifier;

function isEOMixin(u: unknown): u is EOMixin {
  return isNode(u, 'Identifier');
}

/** A top-level instance property in an Ember Object's ObjectExpression */
export interface EOProp extends ObjectProperty {
  key: Identifier;
}

function isEOProp(u: unknown): u is EOProp {
  return isNode(u, 'ObjectProperty') && isNode(u.key, 'Identifier');
}

/** A top-level instance property in an Ember Object's ObjectExpression */
export interface EOMethod extends ObjectMethod {
  key: Identifier;
}

export function isEOMethod(u: unknown): u is EOMethod {
  return isNode(u, 'ObjectMethod') && isNode(u.key, 'Identifier');
}

export interface EOFunctionExpressionProp extends EOProp {
  value: FunctionExpression;
}

export function isEOFunctionExpressionProp(
  u: unknown
): u is EOFunctionExpressionProp {
  return isEOProp(u) && isNode(u.value, 'FunctionExpression');
}

export interface EOCallExpressionProp extends EOProp {
  value: EOCallExpression;
}

export function isEOCallExpressionProp(u: unknown): u is EOCallExpressionProp {
  return isEOProp(u) && isEOCallExpression(u.value);
}

/** A CallExpression value for an EOProperty */
export interface EOCallExpression extends CallExpression {
  callee: EOCallExpressionCallee;
}

function isEOCallExpression(u: unknown): u is EOCallExpression {
  return isNode(u, 'CallExpression') && isEOCallExpressionCallee(u.callee);
}

type EOCallExpressionCallee = Identifier | EOMemberExpressionForModifier;

function isEOCallExpressionCallee(u: unknown): u is EOCallExpressionCallee {
  return isNode(u, 'Identifier') || isEOMemberExpressionForModifier(u);
}

interface EOMemberExpressionForModifier extends MemberExpression {
  object: EOCallExpression;
}

export function isEOMemberExpressionForModifier(
  u: unknown
): u is EOMemberExpressionForModifier {
  return isNode(u, 'MemberExpression') && isEOCallExpression(u.object);
}

export interface EOCallExpressionInnerCallee extends CallExpression {
  callee: Identifier;
}

export function isEOCallExpressionInnerCallee(
  u: unknown
): u is EOCallExpressionInnerCallee {
  return isNode(u, 'CallExpression') && isNode(u.callee, 'Identifier');
}

/** An EOProperty that should be transformed into a class decorator */
export interface EOClassDecoratorProp extends EOProp {
  value: EOClassDecoratorValue;
  key: EOClassDecoratorKey;
}

export function isEOClassDecoratorProp(u: unknown): u is EOClassDecoratorProp {
  return (
    isEOProp(u) &&
    isEOClassDecoratorValue(u.value) &&
    isEOClassDecoratorKey(u.key)
  );
}

type EOClassDecoratorValue = StringLiteral | ArrayExpression | Identifier;

function isEOClassDecoratorValue(u: unknown): u is EOClassDecoratorValue {
  return isNode(u, 'StringLiteral', 'ArrayExpression', 'Identifier');
}

interface EOClassDecoratorKey extends Identifier {
  name: ClassDecoratorName;
}

function isEOClassDecoratorKey(u: unknown): u is EOClassDecoratorKey {
  return isIdent(u, ...CLASS_DECORATOR_NAMES);
}

export interface EOActionsProp extends EOProp {
  value: EOActionsObjectExpression;
  key: EOActionsObjectKey;
}

export function isEOActionsProp(u: unknown): u is EOActionsProp {
  return (
    isEOProp(u) &&
    isEOActionsObjectExpression(u.value) &&
    isEOActionsObjectKey(u.key)
  );
}

interface EOActionsObjectExpression extends ObjectExpression {
  properties: EOAction[];
}

function isEOActionsObjectExpression(
  u: unknown
): u is EOActionsObjectExpression {
  return isNode(u, 'ObjectExpression') && u.properties.every(isEOAction);
}

type EOAction = EOActionMethod | EOActionProp;

function isEOAction(u: unknown): u is EOAction {
  return isEOActionMethod(u) || isEOActionProp(u);
}

type EOActionMethod = EOMethod;

export function isEOActionMethod(u: unknown): u is EOActionMethod {
  return isEOMethod(u);
}

export interface EOActionProp extends EOProp {
  value: Identifier;
}

function isEOActionProp(u: unknown): u is EOActionProp {
  return isEOProp(u) && isNode(u.value, 'Identifier');
}

interface EOActionsObjectKey extends Identifier {
  name: ACTIONS_NAME;
}

function isEOActionsObjectKey(u: unknown): u is EOActionsObjectKey {
  return isIdent(u, ACTIONS_NAME);
}

export interface EOSimpleProp extends EOProp {
  value: Exclude<
    EOProp['value'],
    | ArrayPattern
    | AssignmentPattern
    | ObjectPattern
    | PropertyPattern
    | RestElement
    | SpreadElementPattern
    | SpreadPropertyPattern
    | TSParameterProperty
  >;
}

export function isEOSimpleProp(u: unknown): u is EOSimpleProp {
  return (
    isEOProp(u) &&
    !u.value.type.includes('Pattern') &&
    u.value.type !== 'RestElement' &&
    u.value.type !== 'TSParameterProperty'
  );
}

interface EOActionInfiniteCall extends CallExpression {
  callee: EOActionInfiniteCallCallee;
}

export function makeEOActionInfiniteCallAssertion(
  name: string
): (u: unknown) => u is EOActionInfiniteCall {
  return function isEOActionInfiniteCallForName(
    u: unknown
  ): u is EOActionInfiniteCall {
    return isEOActionInfiniteCall(u, name);
  };
}

function isEOActionInfiniteCall(
  u: unknown,
  name?: string
): u is EOActionInfiniteCall {
  return (
    isNode(u, 'CallExpression') && isEOActionInfiniteCallCallee(u.callee, name)
  );
}

interface EOActionInfiniteCallCallee extends MemberExpression {
  object: ThisExpression;
  property: Identifier;
}

function isEOActionInfiniteCallCallee(
  u: unknown,
  name?: string
): u is EOActionInfiniteCallCallee {
  return (
    isNode(u, 'MemberExpression') &&
    isNode(u.object, 'ThisExpression') &&
    isNode(u.property, 'Identifier') &&
    (!name || u.property.name === name)
  );
}

interface EOActionInfiniteLiteral extends StringLiteral {
  value: string;
}

export function makeEOActionInfiniteLiteralAssertion(
  name: string
): (u: unknown) => u is EOActionInfiniteLiteral {
  return function isEOActionInfiniteLiteralForName(
    u: unknown
  ): u is EOActionInfiniteLiteral {
    return isEOActionInfiniteLiteral(u, name);
  };
}

function isEOActionInfiniteLiteral(
  u: unknown,
  name?: string
): u is EOActionInfiniteLiteral {
  return isNode(u, 'StringLiteral') && (!name || u.value === name);
}

export interface EOSuperExpression extends CallExpression {
  callee: EOSuperExpressionCallee;
}

export function isEOSuperExpression(u: unknown): u is EOSuperExpression {
  return isNode(u, 'CallExpression') && isEOSuperExpressionCallee(u.callee);
}

interface EOSuperExpressionCallee extends MemberExpression {
  property: Identifier & { name: '_super' };
}

function isEOSuperExpressionCallee(u: unknown): u is EOSuperExpressionCallee {
  return isNode(u, 'MemberExpression') && isIdent(u.property, '_super');
}

export interface DecoratorImportDeclaration extends ImportDeclaration {
  source: StringLiteral;
}

export function makeDecoratorImportDeclarationAssertion(
  path: string
): (u: unknown) => u is DecoratorImportDeclaration {
  return function isDecoratorImportDeclarationForPath(
    u: unknown
  ): u is DecoratorImportDeclaration {
    return isDecoratorImportDeclaration(u, path);
  };
}

function isDecoratorImportDeclaration(
  u: unknown,
  path?: string
): u is DecoratorImportDeclaration {
  return (
    isNode(u, 'ImportDeclaration') &&
    isDecoratorImportDeclarationSource(u.source, path)
  );
}

interface DecoratorImportDeclarationSource extends StringLiteral {
  __brand: 'DecoratorImportDeclarationSource';
}

function isDecoratorImportDeclarationSource(
  u: unknown,
  value?: string | undefined
): u is DecoratorImportDeclarationSource {
  return isNode(u, 'StringLiteral') && (!value || u.value === value);
}

/** Find nodes of a specific type within the nodes of this collection. */
export function findPaths<T extends ASTNode, M extends T>(
  collection: Collection,
  type: Type<T>,
  assertion: (v: unknown) => v is M
): Collection<M> {
  return collection.find(type as Type<M>, assertion);
}

/** Get the first path in a collection */
export function getFirstPath<T extends ASTNode>(
  collection: Collection<T>
): Path<T> | undefined {
  return collection.length > 0 ? (collection.get() as Path<T>) : undefined;
}

/** Get the first declaration in the program */
export function getFirstDeclaration(root: Collection): Collection<Declaration> {
  return root.find(j.Declaration).at(0) as Collection<Declaration>;
}
