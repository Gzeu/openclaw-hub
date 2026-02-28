#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, Copy)]
pub enum PaymentStatus {
    Deposited,
    Released,
    Refunded,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi)]
pub struct Payment<M: ManagedTypeApi> {
    pub payer: ManagedAddress<M>,
    pub payee: ManagedAddress<M>,
    pub amount: BigUint<M>,
    pub task_id: ManagedBuffer<M>,
    pub status: PaymentStatus,
    pub created_at: u64,
}

#[multiversx_sc::contract]
pub trait OpenClawPayments {
    #[init]
    fn init(&self) {
        let caller = self.blockchain().get_caller();
        self.owner().set(&caller);

        if self.next_payment_id().is_empty() {
            self.next_payment_id().set(1u64);
        }
    }

    // --- Core: EGLD escrow --------------------------------------------------

    /// Payer deposits EGLD for a task, to be released later to `payee`.
    #[payable("EGLD")]
    #[endpoint(deposit)]
    fn deposit(
        &self,
        payee: ManagedAddress,
        task_id: ManagedBuffer,
    ) -> u64 {
        let amount = self.call_value().egld_value().clone_value();
        require!(amount > 0u32, "Deposit amount must be > 0");
        require!(payee != ManagedAddress::zero(), "Invalid payee");

        let payer = self.blockchain().get_caller();
        let now = self.blockchain().get_block_timestamp();

        let id = self.next_payment_id().get();
        self.next_payment_id().set(id + 1);

        let p = Payment {
            payer: payer.clone(),
            payee: payee.clone(),
            amount: amount.clone(),
            task_id: task_id.clone(),
            status: PaymentStatus::Deposited,
            created_at: now,
        };

        self.payments(id).set(&p);
        self.deposit_event(id, &payer, &payee, &amount, &task_id);

        id
    }

    /// Release funds to payee. Intended to be called by Hub/owner after task is completed.
    #[endpoint(release)]
    fn release(&self, payment_id: u64) {
        self.require_owner();

        let mut p = self.payments(payment_id).get();
        require!(p.status == PaymentStatus::Deposited, "Not releasable");

        let payee = p.payee.clone();
        let amount = p.amount.clone();

        self.send().direct_egld(&payee, &amount);

        p.status = PaymentStatus::Released;
        self.payments(payment_id).set(&p);

        self.release_event(payment_id, &payee, &amount);
    }

    /// Refund funds to payer. Intended to be called by Hub/owner when task fails/cancels.
    #[endpoint(refund)]
    fn refund(&self, payment_id: u64) {
        self.require_owner();

        let mut p = self.payments(payment_id).get();
        require!(p.status == PaymentStatus::Deposited, "Not refundable");

        let payer = p.payer.clone();
        let amount = p.amount.clone();

        self.send().direct_egld(&payer, &amount);

        p.status = PaymentStatus::Refunded;
        self.payments(payment_id).set(&p);

        self.refund_event(payment_id, &payer, &amount);
    }

    // --- Views --------------------------------------------------------------

    #[view(getPayment)]
    fn get_payment(&self, payment_id: u64) -> Payment<Self::Api> {
        self.payments(payment_id).get()
    }

    #[view(getOwner)]
    fn get_owner(&self) -> ManagedAddress {
        self.owner().get()
    }

    // --- Internal -----------------------------------------------------------

    fn require_owner(&self) {
        let caller = self.blockchain().get_caller();
        require!(caller == self.owner().get(), "Only owner");
    }

    // --- Storage ------------------------------------------------------------

    #[storage_mapper("owner")]
    fn owner(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("nextPaymentId")]
    fn next_payment_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("payments")]
    fn payments(&self, id: u64) -> SingleValueMapper<Payment<Self::Api>>;

    // --- Events -------------------------------------------------------------

    #[event("deposit")]
    fn deposit_event(
        &self,
        #[indexed] payment_id: u64,
        #[indexed] payer: &ManagedAddress,
        #[indexed] payee: &ManagedAddress,
        amount: &BigUint,
        task_id: &ManagedBuffer,
    );

    #[event("release")]
    fn release_event(
        &self,
        #[indexed] payment_id: u64,
        #[indexed] payee: &ManagedAddress,
        amount: &BigUint,
    );

    #[event("refund")]
    fn refund_event(
        &self,
        #[indexed] payment_id: u64,
        #[indexed] payer: &ManagedAddress,
        amount: &BigUint,
    );
}
