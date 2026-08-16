import "./PrivacyPolicyPage.css";

function PrivacyPolicyPage() {
    return (
        <section className="privacy-page">
            <header className="privacy-page__header">
                <p>Privacy</p>

                <h1>Privacy Policy</h1>

                <p>
                    This page explains what information Life Ledger stores,
                    why it is used and what control you have over your account data.
                </p>
            </header>
            <div className="privacy-page__content">
                <section className="privacy-card">
                    <h2>Information Life Ledger stores</h2>

                    <p>
                        Life Ledger stores the information needed to provide your account
                        and commitment-tracking features. This may include your username,
                        email address, account plan and the commitment information that
                        you choose to enter.
                    </p>

                    <p>
                        Commitment information may include titles, providers, amounts,
                        payment frequencies, payment statuses, priorities, notes, payment-cycle
                        history and dates such as due dates, renewal dates, contract deadlines
                        and the date a payment was marked as paid.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>How your information is used</h2>

                    <p>
                        Your information is used to authenticate your account, store and
                        display your commitments, calculate relevant dashboard summaries
                        and deadlines, and provide the Life Ledger features available to
                        your account.
                    </p>

                    <p>
                        Life Ledger does not use your commitment data for advertising or
                        automated marketing.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>Payment and banking information</h2>

                    <p>
                        Life Ledger does not store payment card details, bank account
                        credentials or Open Banking information. Payments to providers
                        take place outside the application.
                    </p>

                    <p>
                        The Premium upgrade included in this prototype is a mock payment
                        flow only. No real payment is processed and no payment details are
                        collected.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>Premium prototype features</h2>

                    <p>
                        Some Premium functionality is demonstrated as a prototype preview.
                        Family commitments do not provide real multi-user sharing, and AI
                        Quick Add does not send your text to an external AI service in this
                        version.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>Who can access your data</h2>

                    <p>
                        Your personal commitments are linked to your authenticated account.
                        Life Ledger applies user-specific access controls so that ordinary
                        users cannot view or modify another user's commitments.
                    </p>

                    <p>
                        Administrator-managed commitment guidance and trusted external
                        links are shared application content and do not contain your
                        personal commitment information.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>External links</h2>

                    <p>
                        Life Ledger may provide links to official, informational or
                        comparison websites. When you follow an external link, you leave
                        Life Ledger and the privacy practices of the external website
                        apply.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>How long information is kept</h2>

                    <p>
                        Your account and commitment information is kept while your Life
                        Ledger account exists. Archived commitments remain associated with
                        your account until you permanently delete them or delete your
                        account.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>Deleting your information</h2>

                    <p>
                        Individual commitments can be archived and then permanently
                        deleted from the Archived view.
                    </p>

                    <p>
                        You can also permanently delete your Life Ledger account from
                        Settings. Account deletion removes the account and associated
                        Life Ledger data and cannot be undone.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>Your choices and rights</h2>

                    <p>
                        You can review and update the commitment information stored in
                        your account and delete information that you no longer want Life
                        Ledger to retain.
                    </p>

                    <p>
                        Data protection law may also provide rights relating to your
                        personal information, including rights to access, correct or erase
                        information in appropriate circumstances.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>Security</h2>

                    <p>
                        Life Ledger uses authenticated access and user-specific API
                        controls to protect account data. Passwords are handled through
                        Django's authentication system rather than being stored as plain
                        text by the application.
                    </p>
                </section>

                <section className="privacy-card">
                    <h2>About this prototype</h2>

                    <p>
                        Life Ledger is an MSc software project and prototype application.
                        This privacy page describes how the implemented prototype handles
                        information and is not intended to replace professional legal
                        advice or a production privacy notice.
                    </p>
                </section>
            </div>
        </section>
    );
}

export default PrivacyPolicyPage;