export const validateArray = (data) => {
    if (!data || !Array.isArray(data) || data.length == 0)
        return true;
    return false;
}
