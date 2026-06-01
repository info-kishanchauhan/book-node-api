// export const __prepareErrorObject = (errors: any) => {
//     const errorObject: any = {};
//     errors?.forEach((error: any) => {
//         const path = error.path.join('.');
//         errorObject[path] = error.message.replace(/"/g, '');
//     });
//     return errorObject;
// };

export const __prepareErrorObject = (errors: any) => {
    if (!errors || !Array.isArray(errors)) return null;

    const errorObject: any = {};
    errors.forEach((error: any) => {
        const path = error.path && error.path.length > 0 ? error.path.join('.') : 'root';
        // Only keep the first error message for a specific field
        if (!errorObject[path]) {
            errorObject[path] = error.message.replace(/"/g, '');
        }
    });

    return Object.keys(errorObject).length > 0 ? errorObject : null;
};