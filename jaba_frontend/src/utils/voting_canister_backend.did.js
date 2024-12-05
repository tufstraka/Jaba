export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addOrUpdateUser' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'principal' : IDL.Text,
              'name' : IDL.Text,
              'createdAt' : IDL.Text,
              'email' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'categoriesLen' : IDL.Func([], [IDL.Nat64], ['query']),
    'createCategory' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'createComment' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'content' : IDL.Text,
              'createdAt' : IDL.Text,
              'author' : IDL.Text,
              'proposalId' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'createProposal' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'status' : IDL.Text,
              'noVotes' : IDL.Text,
              'title' : IDL.Text,
              'creator' : IDL.Text,
              'yesVotes' : IDL.Text,
              'createdAt' : IDL.Text,
              'description' : IDL.Text,
              'category' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'endProposal' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'status' : IDL.Text,
              'noVotes' : IDL.Text,
              'title' : IDL.Text,
              'creator' : IDL.Text,
              'yesVotes' : IDL.Text,
              'createdAt' : IDL.Text,
              'description' : IDL.Text,
              'category' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'getCategories' : IDL.Func(
        [],
        [IDL.Vec(IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text }))],
        ['query'],
      ),
    'getCategory' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getComments' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Text,
                'content' : IDL.Text,
                'createdAt' : IDL.Text,
                'author' : IDL.Text,
                'proposalId' : IDL.Text,
              })
            ),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getProposal' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'status' : IDL.Text,
              'noVotes' : IDL.Text,
              'title' : IDL.Text,
              'creator' : IDL.Text,
              'yesVotes' : IDL.Text,
              'createdAt' : IDL.Text,
              'description' : IDL.Text,
              'category' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getProposals' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'id' : IDL.Text,
              'status' : IDL.Text,
              'noVotes' : IDL.Text,
              'title' : IDL.Text,
              'creator' : IDL.Text,
              'yesVotes' : IDL.Text,
              'createdAt' : IDL.Text,
              'description' : IDL.Text,
              'category' : IDL.Text,
            })
          ),
        ],
        ['query'],
      ),
    'getProposalsPaginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Text,
                'status' : IDL.Text,
                'noVotes' : IDL.Text,
                'title' : IDL.Text,
                'creator' : IDL.Text,
                'yesVotes' : IDL.Text,
                'createdAt' : IDL.Text,
                'description' : IDL.Text,
                'category' : IDL.Text,
              })
            ),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'listUsers' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'principal' : IDL.Text,
              'name' : IDL.Text,
              'createdAt' : IDL.Text,
              'email' : IDL.Text,
            })
          ),
        ],
        ['query'],
      ),
    'proposalsLen' : IDL.Func([], [IDL.Nat64], ['query']),
    'usersLen' : IDL.Func([], [IDL.Nat64], ['query']),
    'vote' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'status' : IDL.Text,
              'noVotes' : IDL.Text,
              'title' : IDL.Text,
              'creator' : IDL.Text,
              'yesVotes' : IDL.Text,
              'createdAt' : IDL.Text,
              'description' : IDL.Text,
              'category' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
