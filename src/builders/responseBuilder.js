const successResponse = (user) => {
    return { success: true, user: { id: user.id, username: user.username, created_at: user.createdAt } };
};

const errorResponse = (message) => {
    return { success: false, error: message };
};

export { successResponse, errorResponse }