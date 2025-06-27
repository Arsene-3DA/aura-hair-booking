
interface StepperProps {
  currentStep: number;
  steps: string[];
}

const BookingStepper = ({ currentStep, steps }: StepperProps) => {
  return (
    <div className="sticky top-4 z-40 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Pastille */}
            <div className={`
              flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold text-sm
              transition-all duration-200
              ${index === currentStep 
                ? 'bg-luxury-gold-500 border-luxury-gold-500 text-luxury-black scale-110' 
                : index < currentStep
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-200 border-gray-300 text-gray-500'
              }
            `}>
              {index + 1}
            </div>
            
            {/* Label */}
            <span className={`
              ml-3 font-medium transition-colors duration-200
              ${index === currentStep ? 'text-luxury-gold-600' : 'text-luxury-charcoal/70'}
            `}>
              {step}
            </span>
            
            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-4 transition-colors duration-200
                ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingStepper;
