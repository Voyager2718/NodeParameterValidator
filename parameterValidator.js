let settings = {
    dictAcceptMoreKeys: false,
    arrayAcceptMoreValues: false,
    emptyDictImpliesAcceptEverything: true,     // If false, value should strictly be {}.
    emptyArrayImpliesAcceptEverything: true,    // If false, value should strictly be [].
    escapingConfig: {
        number: 'Number',
        boolean: 'Boolean',
        string: 'String',
    }
}

function isDict(value) {
    return typeof value === 'object' && value !== null && !(value instanceof Array) && !(value instanceof Date);
}

function isArray(value) {
    return typeof value === 'object' && value !== null && (value instanceof Array) && !(value instanceof Date);
}

function isNumber(value) {
    return typeof value === 'number' && value !== NaN && value !== Infinity;
}

function isBoolean(value) {
    return typeof value === 'boolean';
}

function isString(value) {
    return typeof value === 'string';
}

function isRegExp(value) {
    return value instanceof RegExp;
}

module.exports = (() => {
    function ParameterVerificator() {
        this.patterns = {};

        this.setPattern = (patternName, pattern) => {
            this.patterns[patternName] = pattern;
            return this;
        }

        let checkRecursively = (target, value) => {
            if (isDict(target) && !isRegExp(target)) {
                if (isDict(value)) {
                    if (Object.keys(target).length === 0 && settings.emptyDictImpliesAcceptEverything) {
                        return true;
                    } else if (Object.keys(target).length === 0 && Object.keys(value).length !== 0 && !settings.emptyDictImpliesAcceptEverything) {
                        return false;
                    } else {
                        for (let key in target) {
                            if (value[key] === undefined) {
                                return false;
                            } else {
                                if (!checkRecursively(target[key], value[key])) {
                                    return false;
                                }
                            }
                        }

                        if (!settings.dictAcceptMoreKeys) {
                            for (let key in value) {
                                if (target[key] === undefined) {
                                    return false;
                                }
                            }
                        }

                        return true;
                    }
                } else {
                    return false;
                }
            } else if (isArray(target)) {
                if (isArray(value)) {
                    if (target.length === 0 && settings.emptyArrayImpliesAcceptEverything) {
                        return true;
                    } else if (target.length === 0 && value.length !== 0 && !settings.emptyArrayImpliesAcceptEverything) {
                        return false;
                    } else if (target.length !== value.length && !settings.arrayAcceptMoreValues) {
                        return false;
                    } else {
                        for (let i = 0; i < target.length; i++) {
                            if (!checkRecursively(target[i], value[i])) { return false; }
                        }
                        return true;
                    }
                } else {
                    return false;
                }
            } else if (isNumber(target) || target === settings.escapingConfig.number) {
                return isNumber(value);
            } else if (isBoolean(target) || target === settings.escapingConfig.boolean) {
                return isBoolean(value);
            } else if (isRegExp(target)) {
                return target.test(value);
            } else if (isString(target) || target === settings.escapingConfig.string) {
                return isString(value);
            } else {
                throw new Error('Unknown type.');
            }
        }

        this.verify = (patternName, parameter) => {
            return checkRecursively(
                this.patterns[patternName],
                parameter
            );
        }
    }

    let instance;

    return {
        getInstance: () => {
            if (instance === undefined) {
                instance = new ParameterVerificator();
                instance.contructor = null;
            }
            return instance;
        }
    }
})();
