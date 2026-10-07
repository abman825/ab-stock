// User-er subscription expire date baranor jonno (Admin control)
exports.renewSubscription = async (req, res) => {
  try {
    const { userId, months = 1 } = req.body;

    // User-ke database e khunja
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User paowa jayni!" });
    }

    // Ajker tarik ba purbor expired date theke 1 mash (30 din) barano
    const currentExpiry = new Date(user.nextPaymentDate) > new Date() 
      ? new Date(user.nextPaymentDate) 
      : new Date();

    currentExpiry.setMonth(currentExpiry.getMonth() + Number(months));

    // Account active kora ebong notun date save kora
    user.isActive = true;
    user.nextPaymentDate = currentExpiry;
    await user.save();

    res.json({
      success: true,
      message: `${user.username}-er subscription saffal bhabe update hoyeche! Notun date: ${user.nextPaymentDate.toISOString().split('T')[0]}`,
      nextPaymentDate: user.nextPaymentDate
    });
  } catch (error) {
    res.status(500).json({ message: "Server error hyeche!" });
  }
};