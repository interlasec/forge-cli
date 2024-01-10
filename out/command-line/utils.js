"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAcceptableSlug = exports.filterSlug = exports.slugify = void 0;
const slugify = (value) => {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');
};
exports.slugify = slugify;
const filterSlug = (slug) => {
    if (slug === '') {
        return undefined;
    }
    const characters = Array.from(slug);
    const dashesOnly = characters.every((char) => char === '-');
    if (dashesOnly) {
        return undefined;
    }
    return slug;
};
exports.filterSlug = filterSlug;
const getAcceptableSlug = (value) => {
    const slug = (0, exports.slugify)(value);
    return (0, exports.filterSlug)(slug);
};
exports.getAcceptableSlug = getAcceptableSlug;
