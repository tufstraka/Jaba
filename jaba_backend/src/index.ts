import {
    Canister,
    nat64,
    Opt,
    query,
    StableBTreeMap,
    text,
    update,
    Vec,
    Result,
    Record,
    Variant,
    Err,
    ic,
    Ok
} from 'azle/experimental';
import { v4 as uuidv4 } from 'uuid';

const User = Record({
    principal: text,
    name: text,
    email: text,
    createdAt: nat64,
    role: Variant({ USER: null, ADMIN: null })
});

const Proposal = Record({
    id: text,
    title: text,
    description: text,
    yesVotes: nat64,
    noVotes: nat64,
    createdAt: nat64,
    creator: text,
    status: Variant({ OPEN: null, CLOSED: null, EXECUTED: null, REJECTED: null }),
    category: text
});

const Category = Record({
    id: text,
    name: text
});

const Comment = Record({
    id: text,
    proposalId: text,
    content: text,
    author: text,
    createdAt: nat64,
});

const Error = Record({
    code: nat64,
    message: text
});

let proposals = StableBTreeMap(0, text, Proposal);
let categories = StableBTreeMap(1, text, Category);
let users = StableBTreeMap(2, text, User);
let comments = StableBTreeMap(3, text, Comment);
let votes = StableBTreeMap(4, text, text);
let titleToIdMap = StableBTreeMap(5, text, text);

export default Canister({
    addOrUpdateUser: update([text, text, text], Result(User, Error), (principal, name, email) => {
        if (!name.trim()) return Err({ code: 1, message: "Name cannot be empty" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Err({ code: 2, message: "Invalid email format" });

        const currentTime = BigInt(Date.now());
        const existingUser = users.get(principal);

        const newUser = {
            principal,
            name,
            email,
            createdAt: existingUser ? existingUser.createdAt : currentTime,
            role: existingUser?.role || { USER: null }
        };

        users.insert(principal, newUser);
        return Ok(newUser);
    }),

    createProposal: update([text, text, text, text], Result(Proposal, Error), (title, description, category, creator) => {
        if (!title.trim() || title.length > 100) return Err({ code: 1, message: "Title must be 1-100 characters long" });
        if (!description.trim() || description.length > 500) return Err({ code: 2, message: "Description must be 1-500 characters long" });

        if (!users.get(creator)) return Err({ code: 3, message: "User not registered" });

        if (titleToIdMap.contains(title.toLowerCase())) return Err({ code: 4, message: "Duplicate proposal title" });

        const existingCategory = categories.get(category);
        if (!existingCategory) return Err({ code: 5, message: `Category "${category}" does not exist` });

        const newProposalId = uuidv4();
        const newProposal = {
            id: newProposalId,
            title,
            description,
            yesVotes: BigInt(0),
            noVotes: BigInt(0),
            createdAt: BigInt(Date.now()),
            creator,
            status: { OPEN: null },
            category
        };

        proposals.insert(newProposalId, newProposal);
        titleToIdMap.insert(title.toLowerCase(), newProposalId);
        return Ok(newProposal);
    }),

    vote: update([text, text, text], Result(Proposal, Error), (proposalId, voteType, voter) => {
        if (!users.get(voter)) return Err({ code: 1, message: "User not registered" });

        const proposal = proposals.get(proposalId);
        if (!proposal) return Err({ code: 2, message: "Proposal does not exist" });

        if (!proposal.status.OPEN) return Err({ code: 3, message: "Proposal is not open for voting" });

        const voteKey = `${proposalId}_${voter}`;
        if (votes.contains(voteKey)) return Err({ code: 4, message: "Duplicate vote" });

        const normalizedVote = voteType.toLowerCase();
        if (normalizedVote === "yes") proposal.yesVotes += BigInt(1);
        else if (normalizedVote === "no") proposal.noVotes += BigInt(1);
        else return Err({ code: 5, message: `Invalid vote type "${voteType}"` });

        proposals.insert(proposalId, proposal);
        votes.insert(voteKey, normalizedVote);
        return Ok(proposal);
    }),

    endProposal: update([text], Result(Proposal, Error), (proposalId) => {
        const proposal = proposals.get(proposalId);
        if (!proposal) return Err({ code: 1, message: "Proposal does not exist" });

        if (!proposal.status.OPEN) return Err({ code: 2, message: "Proposal already ended" });

        if (proposal.creator !== ic.caller().toString()) return Err({ code: 3, message: "Only creator can end the proposal" });

        proposal.status = proposal.yesVotes > proposal.noVotes ? { EXECUTED: null } : { REJECTED: null };
        proposals.insert(proposalId, proposal);
        return Ok(proposal);
    }),

    createComment: update([text, text, text], Result(Comment, Error), (proposalId, content, author) => {
        if (!content.trim()) return Err({ code: 1, message: "Comment cannot be empty" });

        if (!users.get(author)) return Err({ code: 2, message: "User not registered" });

        if (!proposals.get(proposalId)) return Err({ code: 3, message: "Proposal does not exist" });

        const newCommentId = uuidv4();
        const newComment = {
            id: newCommentId,
            proposalId,
            content: content.trim(),
            author,
            createdAt: BigInt(Date.now())
        };

        comments.insert(newCommentId, newComment);
        return Ok(newComment);
    }),

    getProposalsPaginated: query([nat64, nat64], Result(Vec(Proposal), Error), (offset, limit) => {
        const allProposals = proposals.values();
        return Ok(allProposals.slice(Number(offset), Number(offset) + Number(limit)));
    }),

    listUsers: query([], Vec(User), () => users.values()),

    getCategories: query([], Vec(Category), () => categories.values()),

    proposalsLen: query([], nat64, () => proposals.len()),
    categoriesLen: query([], nat64, () => categories.len()),
    usersLen: query([], nat64, () => users.len())
});
