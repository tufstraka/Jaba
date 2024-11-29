import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addOrUpdateUser' : ActorMethod<
    [string, string, string],
    {
        'Ok' : {
          'principal' : string,
          'name' : string,
          'createdAt' : string,
          'email' : string,
        }
      } |
      { 'Err' : { 'message' : string } }
  >,
  'categoriesLen' : ActorMethod<[], bigint>,
  'createCategory' : ActorMethod<
    [string],
    { 'Ok' : { 'id' : string, 'name' : string } } |
      { 'Err' : { 'message' : string } }
  >,
  'createComment' : ActorMethod<
    [string, string, string],
    {
        'Ok' : {
          'id' : string,
          'content' : string,
          'createdAt' : string,
          'author' : string,
          'proposalId' : string,
        }
      } |
      { 'Err' : { 'message' : string } }
  >,
  'createProposal' : ActorMethod<
    [string, string, string, string],
    {
        'Ok' : {
          'id' : string,
          'status' : string,
          'noVotes' : string,
          'title' : string,
          'creator' : string,
          'yesVotes' : string,
          'createdAt' : string,
          'description' : string,
          'category' : string,
        }
      } |
      { 'Err' : { 'message' : string } }
  >,
  'endProposal' : ActorMethod<[string], { 'Ok' : string } | { 'Err' : string }>,
  'getCategories' : ActorMethod<[], Array<{ 'id' : string, 'name' : string }>>,
  'getCategory' : ActorMethod<
    [string],
    { 'Ok' : { 'id' : string, 'name' : string } } |
      { 'Err' : { 'message' : string } }
  >,
  'getComments' : ActorMethod<
    [string],
    {
        'Ok' : Array<
          {
            'id' : string,
            'content' : string,
            'createdAt' : string,
            'author' : string,
            'proposalId' : string,
          }
        >
      } |
      { 'Err' : { 'message' : string } }
  >,
  'getProposal' : ActorMethod<
    [string],
    {
        'Ok' : {
          'id' : string,
          'status' : string,
          'noVotes' : string,
          'title' : string,
          'creator' : string,
          'yesVotes' : string,
          'createdAt' : string,
          'description' : string,
          'category' : string,
        }
      } |
      { 'Err' : { 'message' : string } }
  >,
  'getProposals' : ActorMethod<
    [],
    Array<
      {
        'id' : string,
        'status' : string,
        'noVotes' : string,
        'title' : string,
        'creator' : string,
        'yesVotes' : string,
        'createdAt' : string,
        'description' : string,
        'category' : string,
      }
    >
  >,
  'listUsers' : ActorMethod<
    [],
    Array<
      {
        'principal' : string,
        'name' : string,
        'createdAt' : string,
        'email' : string,
      }
    >
  >,
  'proposalsLen' : ActorMethod<[], bigint>,
  'usersLen' : ActorMethod<[], bigint>,
  'vote' : ActorMethod<
    [string, string, string],
    {
        'Ok' : {
          'id' : string,
          'status' : string,
          'noVotes' : string,
          'title' : string,
          'creator' : string,
          'yesVotes' : string,
          'createdAt' : string,
          'description' : string,
          'category' : string,
        }
      } |
      { 'Err' : { 'message' : string } }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
