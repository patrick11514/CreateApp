import bcrypt from 'bcrypt';
import crypto from 'crypto';

type Algorithm = 'SHA256' | 'BCRYPT' | 'ALL';

export class Authme {
    private algorithm: Algorithm;

    constructor(algorithm: Algorithm) {
        this.algorithm = algorithm;
    }

    public comparePassword(password: string, hash: string): boolean {
        switch (this.algorithm) {
            case 'SHA256':
                return this.comparePasswordSHA256(password, hash);
            case 'BCRYPT':
                return this.comparePasswordBCRYPT(password, hash);
            case 'ALL':
                return this.comparePasswordSHA256(password, hash) || this.comparePasswordBCRYPT(password, hash);
            default:
                return false;
        }
    }

    //$SHA$ff7b2932dd99d630$719e07ea4605d91d3848e57c8a7ea7d846d59962673a238cf272fcb11138c72e
    //$SHA$SALT$SHA256(SALT + SHA256(PASS))

    private comparePasswordSHA256(password: string, hash: string): boolean {
        let split = hash.split('$');
        let salt = split[2];
        let passHash = split[3];

        let hashedPassword = crypto.createHash('SHA256').update(password).digest('hex');
        let saltPass = hashedPassword + salt;
        let saltPassHash = crypto.createHash('SHA256').update(saltPass).digest('hex');

        if (saltPassHash == passHash) {
            return true;
        }
        return false;
    }

    //$2a$10$k.LmZj4i321k2NdvssUtvu6sbZ66AfvgajgabKYNc.ETZkrhbtRnO

    private comparePasswordBCRYPT(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }
}
