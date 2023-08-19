const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate('savedBooks');
        },
        user: async (parent, { username }) => {
            return User.findOne({ username }).populate('savedBooks');
        },
        savedBooks: async (parent, { username }) => {
            const params = username ? { username } : {};
            return User.find(params).sort({ createdAt: -1 });
        },
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    }, 


    Mutation: {
        addUser: async (parent, {username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
    },
    login: async (parent, { email, password }) => {
        const user = User.findOne({ email });

        if (!user) {
            throw new AuthenticationError('No use with this email found!');
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError('Incorrect password!');
        }

        const token = signToken(user);

        return { token, user };

    },
    saveBook: async (parent, { bookData }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!');
         },
    },
};

module.exports = resolvers;