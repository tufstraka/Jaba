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
    createdAt: text
});

const Proposal = Record({
    id: text,
    title: text,
    description: text,
    yesVotes: text,
    noVotes: text,
    createdAt: text,
    creator: text,
    status: text,
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
    createdAt: text,
});

const Error = Record({
    message: text
});

// StableBTreeMaps for storing data
let proposals = StableBTreeMap(0, text, Proposal);
let categories = StableBTreeMap(1, text, Category);
let users = StableBTreeMap(2, text, User);
let comments = StableBTreeMap(3, text, Comment);
let votes = StableBTreeMap(4, text, text);

// Add new status types
const ProposalStatus = {
    OPEN: 'Open',
    CLOSED: 'Closed',
    EXECUTED: 'Executed',
    REJECTED: 'Rejected'
};

export default Canister({
    /**
     * Add or update a user
     */
    addOrUpdateUser: update([text, text, text], Result(User, Error), (principal, name, email) => {
        // Add validation
        if (!name || name.trim() === '') {
            return Err({ message: "Name cannot be empty" });
        }
        if (!email || !email.includes('@')) {
            return Err({ message: "Invalid email format" });
        }

        const existingUser = users.get(principal);
        const currentTime = Date.now().toString();

        if (!existingUser) {
            const newUser = {
                principal,
                name,
                email,
                createdAt: currentTime
            };
            users.insert(principal, newUser);
            return { Ok: newUser };
        } else {
            const updatedUser = {
                ...existingUser,
                name,
                email,
                createdAt: existingUser.createdAt 
            };
            users.insert(principal, updatedUser);
            return Ok(updatedUser);
        }
    }),

    /**
     * Create a new proposal
     */
    createProposal: update([text, text, text, text], Result(Proposal, Error), (
        title, 
        description, 
        category, 
        creator
    ) => {
        // Add validation
        if (!title || title.trim() === '') {
            return Err({ message: "Title cannot be empty" });
        }
        if (!description || description.trim() === '') {
            return Err({ message: "Description cannot be empty" });
        }

        // Check if user is registered
        const userExists = users.get(creator);
        if (!userExists) {
            return Err({ message: `Error: User with principal "${creator}" is not registered. Please log in.` });
        }
        // Check for duplicate proposal title
        const existingProposal = proposals.values().find(
            p => p.title.toLowerCase() === title.toLowerCase()
        );
        if (existingProposal) {
            return Err({ Err: `Error: A proposal with the title "${title}" already exists.` });
        }

        // Check if category exists
        const existingCategory = categories.get(category.toString());
        if (!existingCategory) {
            return { Err: `Error: Category ID "${category}" does not exist.` };
        }

        // Generate new proposal ID
        const newProposalId = uuidv4();

        const newProposal = {
            id: newProposalId,
            title,
            description,
            yesVotes: BigInt(0).toString(),
            noVotes: BigInt(0).toString(),
            createdAt: Date.now().toString(),
            creator,
            status: 'Open',
            category,
        };

        proposals.insert(newProposalId, newProposal);
        return Ok(newProposal);
    }),

    /**
     * Cast a vote on a proposal
     */
    vote: update([text, text, text], Result(Proposal, Error), (proposalId, voteType, voter) => {
        // Check if user is registered
        const userExists = users.get(voter);
        if (!userExists) {
            return Err({message: `User with principal "${voter}" is not registered. Please log in.`});
        }

        // Retrieve the proposal
        const proposal = proposals.get(proposalId);
        if (!proposal) {
            return Err({message: `Proposal with ID ${proposalId} does not exist.` });
        }

        // Check proposal status
        if (proposal.status !== 'Open') {
            return Err({message: `Proposal "${proposal.title}" is not open for voting.` });
        }

        // Process the vote
        const normalizedVote = voteType.toLowerCase();
        let updatedProposal = { ...proposal };
        
        if (normalizedVote === 'yes') {
            let yesVotes = BigInt(updatedProposal.yesVotes);
            yesVotes += BigInt(1);
            updatedProposal.yesVotes = yesVotes.toString();
        } else if (normalizedVote === 'no') {
            let noVotes = BigInt(updatedProposal.noVotes);
            noVotes += BigInt(1);
            updatedProposal.noVotes = noVotes.toString();
        } else {
            return Err({message: `Invalid vote type "${voteType}". Please vote "yes" or "no".`} );
        }

        const voteKey = `${proposalId}_${voter}`;
        
        // Update the proposal
        proposals.insert(proposalId, updatedProposal);
        votes.insert(voteKey, voteType);

        return Ok(updatedProposal);
    }),

    /**
     * End a proposal
     */
    endProposal: update([text], Result(Proposal, Error), (proposalId) => {
        // Retrieve the proposal
        const proposal = proposals.get(proposalId);
        if (!proposal) {
            return Err({ message: `Error: Proposal with ID ${proposalId} does not exist.` });
        }

        // Check if proposal is already closed
        if (proposal.status === 'Closed') {
            return Err({ message: `Error: Proposal "${proposal.title}" is already closed.` });
        }

        // Add creator check
        if (proposal.creator !== ic.caller().toString()) {
            return Err({ message: "Only the proposal creator can end the proposal" });
        }

        // Update proposal status to closed
        const yesVotes = BigInt(proposal.yesVotes);
        const noVotes = BigInt(proposal.noVotes);
        
        const status = yesVotes > noVotes ? ProposalStatus.EXECUTED : ProposalStatus.REJECTED;
        
        const updatedProposal = {
            ...proposal,
            status
        };

        proposals.insert(proposalId, updatedProposal);

        return Ok(updatedProposal);
    }),

    /**
     * Create a comment on a proposal
     */
    createComment: update([text, text, text], Result(Comment, Error), (
        proposalId, 
        content, 
        author
    ) => {
        // Validate input
        if (!content || content.trim() === '') {
            return Err({ message: "Comment cannot be empty" });
        }

        // Check if user is registered
        const userExists = users.get(author);
        if (!userExists) {
            return Err({ message: `User with principal "${author}" is not registered. Please log in.` });
        }

        // Check if proposal exists
        const proposal = proposals.get(proposalId.toString());
        if (!proposal) {
            return Err({ message: `Proposal with ID ${proposalId} does not exist.` });
        }

        // Generate new comment ID
        const newCommentId = uuidv4();

        const newComment = {
            id: newCommentId,
            proposalId,
            content: content.trim(),
            author,
            createdAt: Date.now().toString()
        };

        comments.insert(newCommentId, newComment);
        return Ok(newComment);
    }),

    /**
     * Get comments for a specific proposal
     */
    getComments: query([text], Result( Vec(Comment), Error ), (proposalId) => {
        // Check if proposal exists
        const proposal = proposals.get(proposalId);
        if (!proposal) {
            return Err({ message: `Error: Proposal with ID ${proposalId} does not exist.` });
        }
    
        // Filter and return comments for the specific proposal
        const proposalComments = comments.values().filter(
            comment => comment.proposalId === proposalId
        );
    
        return Ok(proposalComments);
    }),

    /**
     * Create a new category
     */
    createCategory: update([text], Result(Category, Error), (name) => {
        // Validate input
        if (!name || name.trim() === '') {
            return Err({ message: "Category name cannot be empty" });
        }

        try {
            // Check if category already exists
            const existingCategory = Array.from(categories.values()).find(
                cat => cat.name.toLowerCase() === name.trim().toLowerCase()
            );
            
            if (existingCategory) {
                return { Err: { message: `A category with the name "${name}" already exists.` } };
            }
            
            // Generate new category ID
            const newCatId = uuidv4();

            console.log('newCatId', newCatId);
            
            const newCategory = {
                id: newCatId,
                name
            };

            categories.insert(newCatId, newCategory);
            return Ok(newCategory); 
        } catch (error) {
            return Err({ message: `Failed to create category: ${(error as any).message}` } );
        }
    }),
        
    /**
     * List all registered users
     */
    listUsers: query([], Vec(User), () => {
        return users.keys().map((key) => users.get(key));
    }),

    /**
     * Get all proposals 
     * @returns All proposals 
     */
    getProposals: query([], Vec(Proposal), () => {
        return proposals.values();
    }),

    /**
     * Get a specific proposal
     *  
     * @param id - The ID of the proposal
     * @returns The proposal
     */
    getProposal: query([text], Result(Proposal, Error), (id) => {        
        const proposal = proposals.get(id);
        if (!proposal) {
            return Err({ message: `Proposal with ID ${id} does not exist.` });
        }
        return Ok(proposal);
    }),

    /**
     * Get all categories
     */
    getCategories: query([], Vec(Category), () => {
        return categories.keys().map((id) => categories.get(id));
    }),

    /**
     * Get a specific category
     * 
     * @param id - The ID of the category
     * @returns The category
     * 
     * @example
     * getCategory(1)
     * // Returns { id: 1, name: "Technology" }
     * 
     * getCategory(2)
     * // Returns { id: 2, name: "Health" }
     * 
     * */
    getCategory: query([text], Result(Category, Error), (id) => {
        const category = categories.get(id);
        if (!category) {
            return Err({ message: `Category with ID ${id} does not exist.` });
        }
        return Ok(category);
    } ),

    /**
     * Additional StableBTreeMap utility methods
     */
    proposalsLen: query([], nat64, () => proposals.len()),
    categoriesLen: query([], nat64, () => categories.len()),
    usersLen: query([], nat64, () => users.len()),

    /**
     * Get proposals paginated
     * 
     * @param offset - The starting index of the proposals
     * @param limit - The number of proposals to return
     * @returns The paginated proposals
     */
    getProposalsPaginated: query([nat64, nat64], Result(Vec(Proposal), Error), (offset, limit) => {
        const allProposals = proposals.values();
        return Ok(allProposals.slice(Number(offset), Number(offset) + Number(limit)));
    }),
});