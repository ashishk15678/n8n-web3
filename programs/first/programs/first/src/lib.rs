use anchor_lang::prelude::*;

declare_id!("AMKFdyFwAYeYqubBVkDvz2eYxEot3dPY9QZ3JyFbn8gm");

#[program]
pub mod first {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
