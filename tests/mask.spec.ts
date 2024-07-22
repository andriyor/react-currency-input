import { test, expect } from '@playwright/test';
import mask from '../src/mask';

test.describe('mask', () => {

    test('should return empty strings when value is not set', async () => {
        const { maskedValue, value } = mask();
        expect(maskedValue).toBe("");
        expect(value).toBe(0);
    });

    test('should return empty strings when value is empty string', async () => {
        const { maskedValue, value } = mask("");
        expect(maskedValue).toBe("");
        expect(value).toBe(0);
    });

    test('should return empty strings when value is null', async () => {
        const { maskedValue, value } = mask(null);
        expect(maskedValue).toBe("");
        expect(value).toBe(0);
    });

    test('should change "0" to "0.00"', async () => {
        const { maskedValue, value } = mask("0");
        expect(maskedValue).toBe("0.00");
        expect(value).toBe(0);
    });

    test('should change "00" to "0.00"', async () => {
        const { maskedValue, value } = mask("00");
        expect(maskedValue).toBe("0.00");
        expect(value).toBe(0);
    });

    test('should change "000" to "0.00"', async () => {
        const { maskedValue, value } = mask("000");
        expect(maskedValue).toBe("0.00");
        expect(value).toBe(0);
    });

    test('should change "0000" to "0.00"', async () => {
        const { maskedValue, value } = mask("0000");
        expect(maskedValue).toBe("0.00");
        expect(value).toBe(0);
    });

    test('should change "0001" to "0.01"', async () => {
        const { maskedValue, value } = mask("0001");
        expect(maskedValue).toBe("0.01");
        expect(value).toBe(0.01);
    });

    test('should change "1001" to "10.01"', async () => {
        const { maskedValue, value } = mask("1001");
        expect(maskedValue).toBe("10.01");
        expect(value).toBe(10.01);
    });

    test('should change "123456789" to "1,234,567.89"', async () => {
        const { maskedValue, value } = mask("123456789");
        expect(maskedValue).toBe("1,234,567.89");
        expect(value).toBe(1234567.89);
    });

    test.describe('with separators', () => {

        test('decimal:"," thousand:"." should change "123456789" to "1.234.567,89"', async () => {
            const { maskedValue, value } = mask("123456789", 2, ",", ".");
            expect(maskedValue).toBe("1.234.567,89");
            expect(value).toBe(1234567.89);
        });

        test('zero length thousand separator should change "123456789" to "1234567.89"', async () => {
            const { maskedValue, value } = mask("123456789", 2, ".", "");
            expect(maskedValue).toBe("1234567.89");
            expect(value).toBe(1234567.89);
        });

        test('zero length decimal separator should change "123456789" to "1,234,56789"', async () => {
            const { maskedValue, value } = mask("123456789", 2, "", ",");
            expect(maskedValue).toBe("1,234,56789");
            expect(value).toBe(1234567.89);
        });

    });

    test.describe('with precision', () => {

        test('set to string value "3" should change "123456789" to "123,456.789"', async () => {
            const { maskedValue, value } = mask("123456789", "3");
            expect(maskedValue).toBe("123,456.789");
            expect(value).toBe(123456.789);
        });

        test('set to 3 should change "123456789" to "123,456.789"', async () => {
            const { maskedValue, value } = mask("123456789", 3);
            expect(maskedValue).toBe("123,456.789");
            expect(value).toBe(123456.789);
        });

        test('set to 0 should change "123456789" to "123,456,789"', async () => {
            const { maskedValue, value } = mask("123456789", 0);
            expect(maskedValue).toBe("123,456,789");
            expect(value).toBe(123456789);
        });

    });

    test.describe('negative numbers', () => {

        test('all "-" should be stripped out if allowNegative is false', async () => {
            expect(mask("123456").maskedValue).toBe("1,234.56");
            expect(mask("-123456").maskedValue).toBe("1,234.56");
            expect(mask("--123456").maskedValue).toBe("1,234.56");
            expect(mask("--123--456").maskedValue).toBe("1,234.56");
            expect(mask("--123--456--").maskedValue).toBe("1,234.56");
        });

        test('single "-" anywhere in the string should result in a negative masked number', async () => {
            expect(mask("-123456", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("123-456", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("123456-", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
        });

        test('single "-" anywhere in the string should result in a negative unmasked number', async () => {
            expect(mask("-123456", "2", ".", ",", true).value).toBe(-1234.56);
            expect(mask("123-456", "2", ".", ",", true).value).toBe(-1234.56);
            expect(mask("123456-", "2", ".", ",", true).value).toBe(-1234.56);
        });

        test('no or even number of "-" should result in a positive number', async () => {
            expect(mask("123456", "2", ".", ",", true).maskedValue).toBe("1,234.56");
            expect(mask("--123456", "2", ".", ",", true).maskedValue).toBe("1,234.56");
            expect(mask("123--456", "2", ".", ",", true).maskedValue).toBe("1,234.56");
            expect(mask("123456--", "2", ".", ",", true).maskedValue).toBe("1,234.56");
            expect(mask("--123456--", "2", ".", ",", true).maskedValue).toBe("1,234.56");
            expect(mask("--123--456--", "2", ".", ",", true).maskedValue).toBe("1,234.56");
            expect(mask("--1--234--56--", "2", ".", ",", true).maskedValue).toBe("1,234.56");
        });

        test('odd number of "-" should result in a negative number', async () => {
            expect(mask("-123456", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("123-456", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("123456-", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("-123-456-", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("-1-23-45-6-", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
            expect(mask("-1-2-3-4-5-6-", "2", ".", ",", true).maskedValue).toBe("-1,234.56");
        });

        test('0 is never negative', async () => {
            expect(mask("0", "2", ".", ",", true).maskedValue).toBe("0.00");
            expect(mask("-0", "2", ".", ",", true).maskedValue).toBe("0.00");
            expect(mask("-0-", "2", ".", ",", true).maskedValue).toBe("0.00");
            expect(mask("--0-", "2", ".", ",", true).maskedValue).toBe("0.00");
        });

        test('just "-" should result in 0.00', async () => {
            expect(mask("-", "2", ".", ",", true).maskedValue).toBe("0.00");
        });

    });

    test.describe('with currency symbol', () => {

        test('"$" prefix should change "0" to "$0.00"', async () => {
            expect(mask("0", "2", ".", ",", true, "$", "").maskedValue).toBe("$0.00");
        });

        test('"kr" suffix should change "0" to "0.00kr"', async () => {
            expect(mask("0", "2", ".", ",", true, "", "kr").maskedValue).toBe("0.00kr");
        });

        test('can have both a prefix and a suffix', async () => {
            expect(mask("0", "2", ".", ",", true, "$", "kr").maskedValue).toBe("$0.00kr");
        });

        test('does not strip whitespaces between amount and symbol', async () => {
            expect(mask("0", "2", ".", ",", true, "$ ", "").maskedValue).toBe("$ 0.00");
            expect(mask("0", "2", ".", ",", true, "", " kr").maskedValue).toBe("0.00 kr");
        });

        test('strips whitespaces before and after value', async () => {
            expect(mask("0", "2", ".", ",", true, "  $ ", "").maskedValue).toBe("$ 0.00");
            expect(mask("0", "2", ".", ",", true, "", " kr   ").maskedValue).toBe("0.00 kr");
        });

        test('"-" should come before the prefix', async () => {
            expect(mask("-20.00", "2", ".", ",", true, "$", "").maskedValue).toBe("-$20.00");
        });

    });

});
